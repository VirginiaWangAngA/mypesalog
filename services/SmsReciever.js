import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';
import { parseMpesaSMS, isMpesaSMS } from './SmsListener';

export function startSmsListener(onMpesaReceived) {
  if (Platform.OS !== 'android') return { remove: () => {} };

  const subscription = DeviceEventEmitter.addListener(
    'onSMSReceived',
    (message) => {
      try {
        const { originatingAddress, messageBody } = message;
        if (isMpesaSMS(originatingAddress, messageBody)) {
          const parsed = parseMpesaSMS(messageBody);
          if (parsed) onMpesaReceived(parsed);
        }
      } catch (e) {
        console.log('SMS parse error', e);
      }
    }
  );

  return subscription;
}