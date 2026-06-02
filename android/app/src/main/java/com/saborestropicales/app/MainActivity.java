package com.saborestropicales.app;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeNotifierPlugin.class);
        registerPlugin(AppControlPlugin.class);
        super.onCreate(savedInstanceState);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (getBridge() == null || getBridge().getWebView() == null) {
                    return;
                }

                getBridge().getWebView().post(() ->
                    getBridge().getWebView().evaluateJavascript(
                        "window.dispatchEvent(new CustomEvent('native-back-button'))",
                        null
                    )
                );
            }
        });
    }
}
