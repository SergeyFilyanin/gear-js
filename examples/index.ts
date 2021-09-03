import { KeyringPair } from '@polkadot/keyring/types';
import * as fs from 'fs';
import { CreateType, GearApi, GearKeyring, getWasmMetadata } from '../src';
import { Program } from '../src/interfaces';

const types = {};
const initMessages = [];
const programs = {};

async function uploadProgram(gearApi: GearApi, keyring: KeyringPair, program: any) {
  if (!program.path) {
    return;
  }
  const code = fs.readFileSync(program.path);
  const payloadTypes = program.meta
    ? await getWasmMetadata(fs.readFileSync(program.meta))
    : {
        init_input: program.initInputType,
        init_output: program.initOutputType,
        input: program.inputType,
        output: program.outputType
      };

  const uploadProgram: Program = {
    code,
    gasLimit: program.gasLimit,
    value: program.value,
    initPayload: program.initPayload,
    initInputType: payloadTypes.init_input
  };
  try {
    await gearApi.program.submit(uploadProgram);
  } catch (error) {
    console.error(`${error.name}: ${error.message}`);
  }
  try {
    await gearApi.program.signAndSend(keyring, (event, data) => {
      types[data.programId] = payloadTypes;
      console.log(event);
      console.log(data);
      programs[program.number] = data.programId;
      initMessages.push(data.initMessageId);
    });
  } catch (error) {
    console.log(error);
    console.error(`${error.name}: ${error.message}`);
  }
  return;
}

async function sendMessage(gearApi: GearApi, keyring: KeyringPair, message: any) {
  const destination = programs[message.program];
  try {
    // Get gasSpent if it is not specified
    const gas = message.gasLimit
      ? message.gasLimit
      : await gearApi.program.getGasSpent(destination, message.payload, types[destination].input);
    console.log(`GAS: ${gas}`);
    await gearApi.message.submit({
      destination: destination,
      payload: message.payload,
      gasLimit: gas,
      value: message.value,
      inputType: types[destination].input
    });
  } catch (error) {
    console.error(`${error.name}: ${error.message}`);
  }
  try {
    await gearApi.message.signAndSend(keyring, (event, data) => {
      console.log(`${message.program}: ${JSON.stringify(message.payload)}`);
      console.log(event);
      console.log(data);
    });
  } catch (error) {
    console.error(`${error.name}: ${error.message}`);
  }
  return;
}

async function createKeyring(path: string) {
  const { keyring, json } = await GearKeyring.create('test');
  fs.writeFileSync(path, JSON.stringify(json));
  return keyring;
}

async function main(pathToTestSettings: string) {
  const settings = JSON.parse(fs.readFileSync(pathToTestSettings).toString());

  // Get keyring
  if (!settings.keyring) {
    throw new Error('Path to file with keyring is not specified');
  }

  const keyring = fs.existsSync(settings.keyring)
    ? GearKeyring.fromJson(fs.readFileSync(settings.keyring).toString())
    : await createKeyring(settings.keyring);

  // Create an api
  const api = settings.customTypes
    ? await GearApi.create({
        customTypes: { ...settings.customTypes }
      })
    : await GearApi.create();

  // Check balance
  if ((await api.balance.findOut(keyring.address)).toNumber() === 0) {
    await api.balance.transferFromAlice(keyring.address, 999999999999999, (event, data) => {
      console.log(event);
    });
  }
  console.log(`Balance of ${keyring.address} is ${(await api.balance.findOut(keyring.address)).toHuman()}`);

  // Subscribe to all events
  // api.events((event) => {
  //   console.log(event.toHuman());
  // });

  const createType = new CreateType(api);

  // Subscribe only to program initialization events
  api.gearEvents.subsribeProgramEvents((event) => {
    console.log(event.toHuman());
  });

  // Subscribe only to Log events
  api.gearEvents.subscribeLogEvents(async (event) => {
    const data: any = event.data[0].toHuman();
    if (parseInt(data.reply[1]) === 0) {
      data.payload = (
        await createType.decode(
          data.reply[0] in initMessages ? types[data.source].init_output : types[data.source].output,
          data.payload
        )
      ).toHuman();
    }
    console.log(data);
  });

  // Upload programs
  if (settings.programs) {
    for (const program of settings.programs) {
      await uploadProgram(api, keyring, program);
    }
  }

  // Send messages
  if (settings.messages) {
    for (const message of settings.messages) {
      await sendMessage(api, keyring, message);
    }
  }

  return 0;
}

main('./examples/settings.json').catch((error) => {
  console.error(error);
});
// .finally(() => process.exit());
