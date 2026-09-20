package com.pesalog.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.telephony.SmsMessage;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SmsReceiver extends BroadcastReceiver {

    private static final String TAG = "PesaLogSMS";

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "SMS received — checking if M-Pesa");

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
        String senderStr = sender != null ? sender.toUpperCase() : "";

        Log.d(TAG, "Sender: " + senderStr);
        Log.d(TAG, "Body: " + body);

        boolean isMpesa = senderStr.contains("MPESA")
                || senderStr.contains("M-PESA")
                || body.contains("M-PESA")
                || body.contains("M-Pesa")
                || (body.contains("Ksh") && body.contains("balance"));

        if (!isMpesa) {
            Log.d(TAG, "Not an M-Pesa message — ignoring");
            return;
        }

        Log.d(TAG, "M-Pesa message detected — sending to React Native");

        final String finalBody = body;
        final ReactInstanceManager reactInstanceManager =
                ((ReactApplication) context.getApplicationContext())
                        .getReactNativeHost()
                        .getReactInstanceManager();

        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

        if (reactContext != null) {
            sendEvent(reactContext, finalBody);
        } else {
            // App not ready yet — wait for it then send
            new Handler(Looper.getMainLooper()).post(() -> {
                reactInstanceManager.addReactInstanceEventListener(
                    new ReactInstanceManager.ReactInstanceEventListener() {
                        @Override
                        public void onReactContextInitialized(ReactContext context2) {
                            sendEvent(context2, finalBody);
                            reactInstanceManager.removeReactInstanceEventListener(this);
                        }
                    }
                );
                if (!reactInstanceManager.hasStartedCreatingInitialContext()) {
                    reactInstanceManager.createReactContextInBackground();
                }
            });
        }
    }

    private void sendEvent(ReactContext reactContext, String body) {
        try {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onMpesaSmsReceived", body);
            Log.d(TAG, "Event emitted to React Native successfully");
        } catch (Exception e) {
            Log.e(TAG, "Failed to emit event: " + e.getMessage());
        }
    }
}