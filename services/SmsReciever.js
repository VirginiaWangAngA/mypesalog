import SmsListener from 'react-native-android-sms-listener';
import { parseMpesaSMS, isMpesaSMS } from './SmsListener';

export function startSmsListener(onMpesaReceived) {
  const subscription = SmsListener.addListener(message => {
    if (isMpesaSMS(message.originatingAddress, message.body)) {
      const parsed = parseMpesaSMS(message.body);
      if (parsed) {
        onMpesaReceived(parsed);
      }
    }
  });
  return subscription;
}