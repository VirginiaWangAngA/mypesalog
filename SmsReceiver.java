package com.pesalog.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.ReactInstanceManager;

public class SmsReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!intent.getAction().equals("android.provider.Telephony.SMS_RECEIVED")) {
            return;
        }

        Bundle bundle = intent.getExtras();
        if (bundle == null) return;

        Object[] pdus = (Object[]) bundle.get("pdus");
        String format = bundle.getString("format");
        if (pdus == null) return;

        StringBuilder fullMessage = new StringBuilder();
        String sender = null;

        for (Object pdu : pdus) {
            SmsMessage sms = SmsMessage.createFromPdu((byte[]) pdu, format);
            if (sender == null) {
                sender = sms.getOriginatingAddress();
            }
            fullMessage.append(sms.getMessageBody());
        }

        String body = fullMessage.toString();

        // Check if this is an M-Pesa message
        boolean isMpesa = (sender != null && sender.toUpperCase().contains("MPESA"))
                || body.contains("M-PESA")
                || body.contains("M-Pesa")
                || (body.contains("Ksh") && body.contains("balance"));

        if (!isMpesa) return;

        // Send to React Native
        MainApplication application = (MainApplication) context.getApplicationContext();
        ReactInstanceManager reactInstanceManager = application
                .getReactNativeHost()
                .getReactInstanceManager();

        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

        if (reactContext != null) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onMpesaSmsReceived", body);
        }
    }
}