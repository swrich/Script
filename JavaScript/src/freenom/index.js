import Env from '../../utils/Env';
const $ = new Env('Freenom.com');
const cookieName = 'swrich_freenomcookie';
const bodyName = 'swrich_freenombody';
const username = 'swrich_freenomusername';
const password = 'swrich_freenompassword';

const APP_COOKIE = $.getdata(cookieName);
const APP_BODY = $.getdata(bodyName);

// FreeNom登录地址
const LOGIN_URL = 'https://my.freenom.com/dologin.php';

// 域名状态地址
const DOMAIN_STATUS_URL = 'https://my.freenom.com/domains.php?a=renewals';

// 域名续期地址
const RENEW_DOMAIN_URL = 'https://my.freenom.com/domains.php?submitrenewals=true';

// 匹配token的正则
const TOKEN_REGEX = '/name="token"svalue="(?P<token>[^"]+)"/i';

// 匹配域名信息的正则
const DOMAIN_INFO_REGEX =
  '/<tr><td>(?P<domain>[^<]+)</td><td>[^<]+</td><td>[^<]+<span class="[^"]+">(?P<days>d+)[^&]+&domain=(?P<id>d+)"/i';

// 匹配登录状态的正则
const LOGIN_STATUS_REGEX = '/<li.*?Logout.*?</li>/i';

// 匹配无域名的正则
const NO_DOMAIN_REGEX = '/<trsclass="carttablerow"><tdscolspan="5">(?P<msg>[^<]+)</td></tr>/i';

// 公用请求头
const HEADERS = {
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
};

const login = () => {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Referer: 'https://my.freenom.com/clientarea.php',
    Cookie: APP_COOKIE,
  };
  const body = APP_BODY;
  const requset = {
    url: LOGIN_URL,
    headers: Object.assign({}, headers, HEADERS),
    body,
  };
  $.log('开始登录~~~~', JSON.stringify(requset));
  return new Promise((resolve) => {
    $.post(requset, (error, response, data) => {
      $.log('LOGIN', JSON.stringify(response));
      resolve();
    });
  });
};

const getDomainPage = () => {
  const headers = {
    Referer: 'https://my.freenom.com/clientarea.php',
    Cookie: APP_COOKIE,
  };
  const requset = {
    url: DOMAIN_STATUS_URL,
    headers: Object.assign({}, headers, HEADERS),
  };
  return new Promise((resolve) => {
    $.post(requset, (error, response, data) => {
      $.log('DOMAIN!!!!!!!!!!', JSON.stringify(response));
      $.log(JSON.stringify(response.body).match(DOMAIN_INFO_REGEX));
      $.log(JSON.stringify(response.body).match(NO_DOMAIN_REGEX));
      resolve();
    });
  });
};

const getUserInfo = () => {
  if ($request && $request.method != 'OPTIONS' && $request.url.match(/dologin.php/)) {
    $.log('freenom request userinfo 😱😱😱:', JSON.stringify($request));
    $.setdata(cookieName, $request.headers['cookie']);
    $.setdata(bodyName, $request.body);
  }
  if ($response) {
    $.log('freenom response userinfo 😱😱😱:', JSON.stringify($response));
    const setCookieStr = $response.headers['set-cookie'];

    const regex1 = /WHMCSZH5eHTGhfvzP=[^;,]+/g;
    const regex2 = /WHMCSUser=[^;,]+/g;

    const matches1 = setCookieStr.match(regex1);
    const matches2 = setCookieStr.match(regex2);
    const currentCookie = $.getdata(cookieName);
    $.setdata(cookieName, `${currentCookie};${matches1[0]};${matches2[0]}`);
  }
};

!(async () => {
  if (typeof $request != 'undefined' || typeof $response != 'undefined') {
    getUserInfo();
    $.log('已保存用户信息', $.getdata(cookieName));
    return;
  }
  await login();
  await getDomainPage();
})()
  .catch((e) => {
    $.log('', `❌失败! 原因: ${e}!`, '');
  })
  .finally(() => {
    $.done();
  });