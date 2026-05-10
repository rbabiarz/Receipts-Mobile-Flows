module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_DEPLOY_BASE_URL ?? '',
  },
});
