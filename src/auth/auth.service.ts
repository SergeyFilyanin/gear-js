import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { createHash, createHmac } from 'crypto';
import { TelegramConstants } from './constants/telegram.constants';
import { GithubConstants } from './constants/github.constants';
import { JwtService } from '@nestjs/jwt';
const fetch = require('node-fetch');

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  verifyTelegramLogin(hash: string, userData: object) {
    const botToken = TelegramConstants.botToken;
    const checkStr = Object.keys(userData)
      .sort()
      .map((key) => `${key}=${userData[key]}`)
      .join('\n');

    const keyHash = createHash('sha256').update(botToken).digest();
    const checkHash = createHmac('sha256', keyHash)
      .update(checkStr)
      .digest('hex');

    return hash === checkHash;
  }

  async loginTelegram(data: any) {
    const { hash, ...userData } = data;
    if (!this.verifyTelegramLogin(hash, userData)) {
      throw new BadRequestException('Incorrect Telegram data');
    }
    const user = await this.userService.saveTgAcc({
      telegramId: data.id,
      name: data.first_name + data.last_name,
      username: data.username,
      photoUrl: data.photo_url,
      authDate: data.auth_date,
      hash: data.hash,
    });

    return {
      access_token: this.jwtService.sign({
        username: user.username,
        id: user.id,
      }),
    };
  }

  async loginGithub(code: string) {
    const accessToken = await this.githubAccessToken(code);
    if (accessToken === 'bad_verification_code') {
      throw new BadRequestException('bad github verification code');
    }
    const userData = await this.githubUserData(accessToken);
    const user = await this.userService.saveGitAcc(userData);
    return {
      access_token: this.jwtService.sign({
        username: user.username,
        id: user.id,
      }),
    };
  }

  async githubAccessToken(code: string) {
    const urlAccessToken = 'https://github.com/login/oauth/access_token';
    const data = {
      code: code,
      client_id: GithubConstants.clientId,
      client_secret: GithubConstants.clientSecret,
    };
    const res = await fetch(urlAccessToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resText: string = await res.text();
    return resText.split('&')[0].split('=')[1];
  }

  async githubUserData(accessToken: string) {
    const urlUserData = 'https://api.github.com/user';
    const res = await fetch(
      `${urlUserData}?client_id=${GithubConstants.clientId}&client_secret=${GithubConstants.clientSecret}`,
      {
        method: 'GET',
        headers: { Authorization: `token ${accessToken}` },
      },
    );

    const resJson = await res.json();
    return {
      username: resJson.login,
      githubId: resJson.id,
      photoUrl: resJson.avatar_url,
      name: resJson.name,
      email: resJson.email,
      accessToken: accessToken,
    };
  }

  async testLogin(id: number) {
    const user = await this.userService.findOne(id);
    if (user) {
      return {
        access_token: this.jwtService.sign({
          username: user.username,
          id: user.id,
        }),
      };
    } else {
      return false;
    }
  }
}
