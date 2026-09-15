package com.pesalog.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SmsReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    Bundle bundle = intent.getExtras();
    if (bundle == null) return;

    Object[] pdus = (Object[]) bundle.get("pdus");
    if (pdus == null) return;

    for (Object pdu : pdus) {
      SmsMessage sms = SmsMessage.createFromPdu((byte[]) pdu);
      String sender = sms.getOriginatingAddress();
      String body = sms.getMessageBody();

      if (sender != null && (sender.contains("MPESA") || sender.contains("M-PESA"))
          || (body != null && body.contains("M-PESA"))) {

        ReactInstanceManager reactInstanceManager =
            ((ReactApplication) context.getApplicationContext())
                .getReactNativeHost()
                .getReactInstanceManager();

        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

        if (reactContext != null) {
          reactContext
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
              .emit("onSMSReceived", body);
        }
      }
    }
  }
}