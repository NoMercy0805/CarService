package com.schiwy.carservice;

import android.app.Activity;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.DocumentsContract;
import android.view.Window;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

public class MainActivity extends Activity {

    private static final int FOLDER_PICKER_REQUEST = 778;
    private WebView webView;
    private WebAppInterface bridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        boolean darkMode = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK)
                == Configuration.UI_MODE_NIGHT_YES;
        window.setStatusBarColor(darkMode ? Color.rgb(15, 16, 19) : Color.rgb(246, 248, 252));
        window.setNavigationBarColor(darkMode ? Color.rgb(15, 16, 19) : Color.rgb(246, 248, 252));

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            int flags = window.getDecorView().getSystemUiVisibility();
            if (!darkMode) {
                flags |= android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            } else {
                flags &= ~android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            }
            window.getDecorView().setSystemUiVisibility(flags);
        }

        webView = new WebView(this);
        webView.setBackgroundColor(darkMode ? Color.rgb(15, 16, 19) : Color.rgb(246, 248, 252));
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setDefaultTextEncodingName("utf-8");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && Build.VERSION.SDK_INT < 33) {
            settings.setForceDark(WebSettings.FORCE_DARK_OFF);
        }

        bridge = new WebAppInterface(this);
        webView.addJavascriptInterface(bridge, "AndroidBridge");

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .addPathHandler("/res/", new WebViewAssetLoader.ResourcesPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            @SuppressWarnings("deprecation")
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                return assetLoader.shouldInterceptRequest(Uri.parse(url));
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                view.evaluateJavascript(
                        "(function(){" +
                        "if(!document.getElementById('carservice-final-css')){" +
                        "var l=document.createElement('link');l.id='carservice-final-css';l.rel='stylesheet';l.href='final.css';document.head.appendChild(l);}" +
                        "if(!document.getElementById('carservice-concept-icons')){" +
                        "var s=document.createElement('script');s.id='carservice-concept-icons';s.src='concept-icons.js';document.head.appendChild(s);}" +
                        "if(!document.getElementById('carservice-backup-system')){" +
                        "var b=document.createElement('script');b.id='carservice-backup-system';b.src='backup.js';document.head.appendChild(b);}" +
                        "if(!document.getElementById('carservice-service-ui-fix')){" +
                        "var f=document.createElement('script');f.id='carservice-service-ui-fix';f.src='service-ui-fix.js';document.head.appendChild(f);}" +
                        "if(!document.getElementById('carservice-vin-profile')){" +
                        "var v=document.createElement('script');v.id='carservice-vin-profile';v.src='vehicle-vin-profile.js';document.head.appendChild(v);}" +
                        "if(!document.getElementById('carservice-history-inline')){" +
                        "var h=document.createElement('script');h.id='carservice-history-inline';h.src='history-ui-fix.js';document.head.appendChild(h);}" +
                        "if(!document.getElementById('carservice-first-aid-kit')){" +
                        "var a=document.createElement('script');a.id='carservice-first-aid-kit';a.src='first-aid-kit.js';document.head.appendChild(a);}" +
                        "if(!document.getElementById('carservice-hu-status')){" +
                        "var hu=document.createElement('script');hu.id='carservice-hu-status';hu.src='hu-status.js';document.head.appendChild(hu);}" +
                        "if(!document.getElementById('carservice-save-feedback')){" +
                        "var sf=document.createElement('script');sf.id='carservice-save-feedback';sf.src='save-feedback.js';document.head.appendChild(sf);}" +
                        "if(!document.getElementById('carservice-manual-picker-search')){" +
                        "var ms=document.createElement('script');ms.id='carservice-manual-picker-search';ms.src='manual-picker-search.js';document.head.appendChild(ms);}" +
                        "if(!document.getElementById('carservice-fuel-tracker')){" +
                        "var ft=document.createElement('script');ft.id='carservice-fuel-tracker';ft.src='fuel-tracker.js';document.head.appendChild(ft);}" +
                        "})();",
                        null
                );
            }
        });

        webView.clearCache(true);
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    /** Called by AndroidBridge.pickBackupFolder(). */
    void launchBackupFolderPicker() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
                | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        try {
            startActivityForResult(intent, FOLDER_PICKER_REQUEST);
        } catch (Exception e) {
            notifyFolderPicked(false, null);
        }
    }

    private void notifyFolderPicked(boolean success, String folderName) {
        if (webView == null) return;
        String safeName = folderName == null ? "null"
                : "'" + folderName.replace("\\", "\\\\").replace("'", "\\'") + "'";
        webView.evaluateJavascript(
                "window.onBackupFolderPicked && window.onBackupFolderPicked(" + success + "," + safeName + ");",
                null);
    }

    private String friendlyFolderName(Uri treeUri) {
        try {
            String docId = DocumentsContract.getTreeDocumentId(treeUri);
            int colon = docId.indexOf(':');
            String path = colon >= 0 ? docId.substring(colon + 1) : docId;
            return path.isEmpty() ? "Gewählter Ordner" : path;
        } catch (Exception e) {
            return "Gewählter Ordner";
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FOLDER_PICKER_REQUEST) {
            if (resultCode == RESULT_OK && data != null && data.getData() != null) {
                Uri treeUri = data.getData();
                try {
                    getContentResolver().takePersistableUriPermission(
                            treeUri,
                            Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                } catch (Exception ignored) {}
                String displayName = friendlyFolderName(treeUri);
                if (bridge != null) bridge.storeBackupFolder(treeUri, displayName);
                notifyFolderPicked(true, displayName);
            } else {
                notifyFolderPicked(false, null);
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        webView.evaluateJavascript(
                "(function(){ return window.closeAnyOpenOverlay ? window.closeAnyOpenOverlay() : false; })();",
                value -> {
                    if ("true".equals(value)) {
                        return;
                    }
                    if (webView.canGoBack()) {
                        webView.goBack();
                    } else {
                        MainActivity.super.onBackPressed();
                    }
                }
        );
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
