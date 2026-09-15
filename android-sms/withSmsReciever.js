const { withAndroidManifest, createRunOncePlugin } = require('@expo/config-plugins');

const withSmsReceiver = (config) => {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application[0];

    if (!app.receiver) app.receiver = [];

    // Add SMS broadcast receiver
    const receiverExists = app.receiver.some(
      r => r.$?.['android:name'] === '.SmsReceiver'
    );

    if (!receiverExists) {
      app.receiver.push({
        $: {
          'android:name': '.SmsReceiver',
          'android:enabled': 'true',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: { 'android:name': 'android.provider.Telephony.SMS_RECEIVED' },
              },
            ],
            $: { 'android:priority': '999' },
          },
        ],
      });
    }

    return config;
  });
};

module.exports = createRunOncePlugin(withSmsReceiver, 'withSmsReceiver', '1.0.0');