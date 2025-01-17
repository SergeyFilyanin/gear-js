import { isNodeAddressValid } from 'shared/helpers';
import { NODE_ADRESS_URL_PARAM } from 'shared/config';

const getNodeAddressFromUrl = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const nodeAddress = searchParams.get(NODE_ADRESS_URL_PARAM);

  if (nodeAddress && isNodeAddressValid(nodeAddress)) {
    return nodeAddress;
  }
};

export { getNodeAddressFromUrl };
