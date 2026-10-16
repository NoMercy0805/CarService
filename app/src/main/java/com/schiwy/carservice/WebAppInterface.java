package com.schiwy.carservice;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.provider.DocumentsContract;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** Native bridge for CarService backups, storage and reminders. */
public class WebAppInterface {
    private static final String PREFS = "backup_prefs";
    private static final String KEY_TREE_URI = "backup_tree_uri";
    private static final String KEY_TREE_NAME = "backup_tree_name";
    private static final String INTERNAL_CURRENT = "carservice-auto-backup.json";
    private static final String INTERNAL_PREVIOUS = "carservice-auto-backup-prev.json";

    private final MainActivity activity;
    private final Context context;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    public WebAppInterface(MainActivity activity) {
        this.activity = activity;
        this.context = activity.getApplicationContext();
    }

    // ---------- Native SQLite storage ----------

    @JavascriptInterface
    public String nativeGetItem(String key) {
        return NativeKeyValueStore.getInstance(context).getItem(key);
    }

    @JavascriptInterface
    public void nativeSetItem(String key, String value) {
        NativeKeyValueStore.getInstance(context).setItem(key, value);
    }

    @JavascriptInterface
    public void nativeRemoveItem(String key) {
        NativeKeyValueStore.getInstance(context).removeItem(key);
    }

    // ---------- Fälligkeits-Benachrichtigungen ----------

    @JavascriptInterface
    public void syncReminderData(String json) {
        if (json == null) return;
        try {
            new JSONArray(json);
            context.getSharedPreferences(ReminderReceiver.PREFS, Context.MODE_PRIVATE)
                    .edit().putString(ReminderReceiver.KEY_DATA, json).apply();
            ReminderReceiver.schedule(context);
            ReminderReceiver.checkNow(context);
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public String getReminderSettings() {
        SharedPreferences prefs = context.getSharedPreferences(ReminderReceiver.PREFS, Context.MODE_PRIVATE);
        JSONObject obj = new JSONObject();
        try {
            obj.put("service", prefs.getBoolean("enabled_service", true));
            obj.put("hu", prefs.getBoolean("enabled_hu", true));
            obj.put("firstAid", prefs.getBoolean("enabled_firstAid", true));
            obj.put("permission", activity.isNotificationPermissionGranted());
        } catch (Exception ignored) {}
        return obj.toString();
    }

    @JavascriptInterface
    public void setReminderEnabled(String type, boolean enabled) {
        if (!"service".equals(type) && !"hu".equals(type) && !"firstAid".equals(type)) return;
        context.getSharedPreferences(ReminderReceiver.PREFS, Context.MODE_PRIVATE)
                .edit().putBoolean("enabled_" + type, enabled).apply();
        ReminderReceiver.schedule(context);
        ReminderReceiver.checkNow(context);
    }

    @JavascriptInterface
    public boolean isReminderPermissionGranted() {
        return activity.isNotificationPermissionGranted();
    }

    @JavascriptInterface
    public void requestReminderPermission() {
        mainHandler.post(activity::requestNotificationPermissionIfNeeded);
    }

    // ---------- Backups ----------

    @JavascriptInterface
    public void pickBackupFolder() {
        mainHandler.post(activity::launchBackupFolderPicker);
    }

    @JavascriptInterface
    public String getBackupFolderName() {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .getString(KEY_TREE_NAME, null);
    }

    @JavascriptInterface
    public boolean hasBackupFolder() {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .getString(KEY_TREE_URI, null) != null;
    }

    @JavascriptInterface
    public void clearBackupFolder() {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String uriString = prefs.getString(KEY_TREE_URI, null);
        if (uriString != null) {
            try {
                Uri treeUri = Uri.parse(uriString);
                context.getContentResolver().releasePersistableUriPermission(
                        treeUri,
                        android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
                                | android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            } catch (Exception ignored) {}
        }
        prefs.edit().remove(KEY_TREE_URI).remove(KEY_TREE_NAME).apply();
    }

    void storeBackupFolder(Uri treeUri, String displayName) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                .putString(KEY_TREE_URI, treeUri.toString())
                .putString(KEY_TREE_NAME, displayName)
                .apply();
    }

    @JavascriptInterface
    public boolean saveToBackupFolder(String base64Data, String filename, String mimeType) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String uriString = prefs.getString(KEY_TREE_URI, null);
        if (uriString == null) return false;
        try {
            byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);
            Uri treeUri = Uri.parse(uriString);
            Uri root = DocumentsContract.buildDocumentUriUsingTree(
                    treeUri, DocumentsContract.getTreeDocumentId(treeUri));
            Uri existing = findChildByName(root, filename);
            if (existing != null) {
                try { DocumentsContract.deleteDocument(context.getContentResolver(), existing); }
                catch (Exception ignored) {}
            }
            Uri created = DocumentsContract.createDocument(
                    context.getContentResolver(), root,
                    mimeType != null ? mimeType : "application/json", filename);
            if (created == null) return false;
            try (OutputStream out = context.getContentResolver().openOutputStream(created)) {
                if (out == null) return false;
                out.write(bytes);
                out.flush();
            }
            return true;
        } catch (Exception e) {
            showToast("Automatische Sicherung fehlgeschlagen: " + e.getMessage());
            return false;
        }
    }

    @JavascriptInterface
    public String readFromBackupFolder(String filename) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String uriString = prefs.getString(KEY_TREE_URI, null);
        if (uriString == null) return null;
        try {
            Uri treeUri = Uri.parse(uriString);
            Uri root = DocumentsContract.buildDocumentUriUsingTree(
                    treeUri, DocumentsContract.getTreeDocumentId(treeUri));
            Uri fileUri = findChildByName(root, filename);
            if (fileUri == null) return null;
            try (InputStream in = context.getContentResolver().openInputStream(fileUri)) {
                return in == null ? null : readAll(in);
            }
        } catch (Exception e) {
            return null;
        }
    }

    @JavascriptInterface
    public synchronized boolean saveInternalBackup(String json) {
        if (!isValidBackup(json)) return false;
        File current = new File(context.getFilesDir(), INTERNAL_CURRENT);
        File previous = new File(context.getFilesDir(), INTERNAL_PREVIOUS);
        File temp = new File(context.getFilesDir(), INTERNAL_CURRENT + ".tmp");
        try {
            String existing = current.exists() ? readFile(current) : null;
            if (existing != null && isValidBackup(existing) && !existing.equals(json)) {
                writeFile(previous, existing);
            }
            writeFile(temp, json);
            if (current.exists() && !current.delete()) {
                temp.delete();
                return false;
            }
            if (!temp.renameTo(current)) {
                writeFile(current, json);
                temp.delete();
            }
            return true;
        } catch (Exception e) {
            temp.delete();
            return false;
        }
    }

    @JavascriptInterface
    public synchronized String readInternalBackup() {
        return readValidFile(new File(context.getFilesDir(), INTERNAL_CURRENT));
    }

    @JavascriptInterface
    public synchronized String readPreviousInternalBackup() {
        return readValidFile(new File(context.getFilesDir(), INTERNAL_PREVIOUS));
    }

    @JavascriptInterface
    public boolean isValidBackupJson(String json) {
        return isValidBackup(json);
    }

    private boolean isValidBackup(String json) {
        if (json == null || json.trim().isEmpty()) return false;
        try {
            JSONObject root = new JSONObject(json);
            JSONArray vehicles = root.optJSONArray("vehicles");
            if (vehicles == null || vehicles.length() < 2) return false;
            boolean has508 = false, has2008 = false;
            for (int i = 0; i < vehicles.length(); i++) {
                JSONObject v = vehicles.optJSONObject(i);
                if (v == null) continue;
                String id = v.optString("id", "");
                if ("508".equals(id)) has508 = true;
                if ("2008".equals(id)) has2008 = true;
                if (v.has("records") && !(v.opt("records") instanceof JSONArray)) return false;
                if (v.has("customTasks") && !(v.opt("customTasks") instanceof JSONArray)) return false;
            }
            return has508 && has2008;
        } catch (Exception e) {
            return false;
        }
    }

    private String readValidFile(File file) {
        try {
            if (!file.exists()) return null;
            String text = readFile(file);
            return isValidBackup(text) ? text : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String readFile(File file) throws Exception {
        try (InputStream in = new FileInputStream(file)) { return readAll(in); }
    }

    private void writeFile(File file, String text) throws Exception {
        try (FileOutputStream out = new FileOutputStream(file, false)) {
            out.write(text.getBytes(StandardCharsets.UTF_8));
            out.flush();
            out.getFD().sync();
        }
    }

    private String readAll(InputStream in) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int read;
        while ((read = in.read(buffer)) != -1) baos.write(buffer, 0, read);
        return baos.toString("UTF-8");
    }

    private Uri findChildByName(Uri root, String displayName) {
        Uri children = DocumentsContract.buildChildDocumentsUriUsingTree(
                root, DocumentsContract.getDocumentId(root));
        android.database.Cursor cursor = null;
        try {
            cursor = context.getContentResolver().query(children,
                    new String[]{DocumentsContract.Document.COLUMN_DOCUMENT_ID,
                            DocumentsContract.Document.COLUMN_DISPLAY_NAME},
                    null, null, null);
            if (cursor == null) return null;
            while (cursor.moveToNext()) {
                if (displayName.equals(cursor.getString(1))) {
                    return DocumentsContract.buildDocumentUriUsingTree(root, cursor.getString(0));
                }
            }
        } catch (Exception ignored) {
        } finally {
            if (cursor != null) cursor.close();
        }
        return null;
    }

    private void showToast(String message) {
        mainHandler.post(() -> Toast.makeText(context, message, Toast.LENGTH_LONG).show());
    }
}
