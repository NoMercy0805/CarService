package com.schiwy.carservice;

import android.app.Activity;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

public class MainActivity extends Activity {

    private WebView webView;

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
                        "var l=document.createElement('link');" +
                        "l.id='carservice-final-css';l.rel='stylesheet';l.href='final.css';document.head.appendChild(l);}" +
                        "function patchVisuals(){" +
                        "document.querySelectorAll('.vehicle-photo img').forEach(function(img){" +
                        "var source=((img.getAttribute('src')||'')+' '+(img.getAttribute('alt')||'')).toLowerCase();" +
                        "var replacement=source.indexOf('2008')>=0?'peugeot-2008.svg':'peugeot-508.svg';" +
                        "if(!img.getAttribute('src')||img.getAttribute('src').indexOf(replacement)<0){img.setAttribute('src',replacement);}" +
                        "img.removeAttribute('onerror');img.style.removeProperty('display');" +
                        "var holder=img.closest('.vehicle-photo');if(holder){holder.classList.remove('image-load-error');}" +
                        "});" +
                        "var icon=document.querySelector('.next-service-icon');" +
                        "if(icon){icon.innerHTML='<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.7 6.3a4 4 0 0 0-5 5L3.5 17.5a2.1 2.1 0 0 0 3 3l6.2-6.2a4 4 0 0 0 5-5l-2.5 2.5-3-3 2.5-2.5Z\"/><path d=\"m15.5 15.5 5 5\"/><path d=\"m18 13 3 3\"/></svg>';" +
                        "var svg=icon.querySelector('svg');if(svg){svg.style.width='24px';svg.style.height='24px';}" +
                        "}" +
                        "}" +
                        "patchVisuals();setTimeout(patchVisuals,80);setTimeout(patchVisuals,300);" +
                        "})();",
                        null
                );
            }
        });

        webView.clearCache(true);
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
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
