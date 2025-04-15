import configPlugins from '@expo/config-plugins';
const { withAndroidManifest} = configPlugins;

const withCleartextTraffic = (config) => {
  return withAndroidManifest(config, async (config) => {
    const app = config.modResults.manifest.application?.[0];

    if (app && !app.$['android:usesCleartextTraffic']) {
      app.$['android:usesCleartextTraffic'] = 'true';
    }

    return config;
  });
};

export default withCleartextTraffic;
