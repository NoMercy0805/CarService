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
                        "var l=document.createElement('link');l.id='carservice-final-css';l.rel='stylesheet';l.href='final.css';document.head.appendChild(l);}" +
                        "if(!document.getElementById('carservice-concept-icon-style')){" +
                        "var s=document.createElement('style');s.id='carservice-concept-icon-style';" +
                        "s.textContent='.next-service-icon svg,.page-title-icon svg{width:25px!important;height:25px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important}.next-service-icon,.page-title-icon{font-family:inherit!important}';document.head.appendChild(s);}" +
                        "function patchVisuals(){" +
                        "document.querySelectorAll('.vehicle-photo img').forEach(function(img){" +
                        "var source=((img.getAttribute('src')||'')+' '+(img.getAttribute('alt')||'')).toLowerCase();" +
                        "var replacement=source.indexOf('2008')>=0?'peugeot-2008.svg':'peugeot-508.svg';" +
                        "if(!img.getAttribute('src')||img.getAttribute('src').indexOf(replacement)<0){img.setAttribute('src',replacement);}" +
                        "img.removeAttribute('onerror');img.style.removeProperty('display');" +
                        "var holder=img.closest('.vehicle-photo');if(holder){holder.classList.remove('image-load-error');}" +
                        "});" +
                        "var icons={" +
                        "next:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"4\" y=\"5\" width=\"16\" height=\"15\" rx=\"2\"/><path d=\"M8 3v4M16 3v4M4 9h16\"/><path d=\"m8.5 14 2 2 4-4\"/></svg>'," +
                        "service:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5L19 15.4a2.1 2.1 0 1 1-3 3l-6.7-6.7\"/><path d=\"m4 20 5.2-5.2\"/><path d=\"M3 21l1-3 2 2-3 1Z\"/></svg>'," +
                        "history:'<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M3 12a9 9 0 1 0 3-6.7\"/><path d=\"M3 4v6h6\"/><path d=\"M12 7v5l3 2\"/></svg>'};" +
                        "var ni=document.querySelector('.next-service-icon');if(ni){ni.innerHTML=icons.next;}" +
                        "document.querySelectorAll('.page-title-row').forEach(function(row){var h=row.querySelector('h2');var b=row.querySelector('.page-title-icon');if(!h||!b)return;var t=(h.textContent||'').trim();if(t==='Peugeot-Service')b.innerHTML=icons.service;if(t==='Historie')b.innerHTML=icons.history;});" +
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
