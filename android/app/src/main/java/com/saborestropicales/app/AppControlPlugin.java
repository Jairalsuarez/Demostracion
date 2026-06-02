package com.saborestropicales.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AppControl")
public class AppControlPlugin extends Plugin {
    @PluginMethod
    public void exitApp(PluginCall call) {
        if (getActivity() != null) {
            getActivity().moveTaskToBack(true);
        }

        JSObject result = new JSObject();
        result.put("exited", true);
        call.resolve(result);
    }
}
