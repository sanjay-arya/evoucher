export default {
  jwtSecret: "@QEGTUI123",
  jwtSecretPhone: "@QEGTUIasdf",
  paymentMethod: ['VISA', 'MASTERCARD'],
  redisConfig: {
    removeOnSuccess: true,
    redis: {
        host: '172.31.30.184',
        port: '6379'
    }
  }
};