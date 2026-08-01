import CryptoJS from 'crypto-js';

const BASE_URL = 'https://api.bitget.com';

function sign(timestamp, method, requestPath, body, secretKey) {
  const message = `${timestamp}${method.toUpperCase()}${requestPath}${body || ''}`;
  return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, secretKey));
}

async function request(method, path, params, credentials) {
  const { apiKey, secretKey, passphrase } = credentials;
  const timestamp = Date.now().toString();

  let fullPath = path;
  let url = `${BASE_URL}${path}`;
  let body = '';

  if (method === 'GET' && params && Object.keys(params).length > 0) {
    const query = new URLSearchParams(params).toString();
    fullPath = `${path}?${query}`;
    url = `${BASE_URL}${fullPath}`;
  } else if (method === 'POST' && params) {
    body = JSON.stringify(params);
  }

  const signature = sign(timestamp, method, fullPath, body, secretKey);

  const response = await fetch(url, {
    method,
    headers: {
      'ACCESS-KEY': apiKey,
      'ACCESS-SIGN': signature,
      'ACCESS-TIMESTAMP': timestamp,
      'ACCESS-PASSPHRASE': passphrase,
      'Content-Type': 'application/json',
      locale: 'pt-BR',
    },
    body: method === 'POST' ? body : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

export async function getSpotAssets(credentials) {
  return request('GET', '/api/v2/spot/account/assets', null, credentials);
}

export async function getSpotOrders(credentials) {
  return request('GET', '/api/v2/spot/trade/history-orders', { limit: '50' }, credentials);
}

export async function getFuturesPositions(credentials) {
  return request(
    'GET',
    '/api/v2/mix/position/all-position',
    { productType: 'USDT-FUTURES', marginCoin: 'USDT' },
    credentials,
  );
}

export async function getFuturesOrders(credentials) {
  return request(
    'GET',
    '/api/v2/mix/order/history-orders',
    { productType: 'USDT-FUTURES', limit: '50' },
    credentials,
  );
}

export async function getFuturesPnL(credentials) {
  return request(
    'GET',
    '/api/v2/mix/position/history-position',
    { productType: 'USDT-FUTURES', limit: '50' },
    credentials,
  );
}

export async function getAccountBalance(credentials) {
  return request('GET', '/api/v2/account/info', null, credentials);
}
