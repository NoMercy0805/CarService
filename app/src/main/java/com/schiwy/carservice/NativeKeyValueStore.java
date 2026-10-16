package com.schiwy.carservice;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

/**
 * Native persistence for the web app's key/value data.
 *
 * CarService keeps its existing JSON structure, but stores the values in a
 * real app-private SQLite database instead of relying on WebView localStorage
 * as the primary persistence layer.
 */
public class NativeKeyValueStore extends SQLiteOpenHelper {

    private static final String DB_NAME = "app_storage.db";
    private static final int DB_VERSION = 1;
    private static final String TABLE = "kv_store";

    private static NativeKeyValueStore instance;

    public static synchronized NativeKeyValueStore getInstance(Context context) {
        if (instance == null) {
            instance = new NativeKeyValueStore(context.getApplicationContext());
        }
        return instance;
    }

    private NativeKeyValueStore(Context context) {
        super(context, DB_NAME, null, DB_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE " + TABLE + " (key TEXT PRIMARY KEY, value TEXT)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // No schema migration required yet.
    }

    public synchronized String getItem(String key) {
        SQLiteDatabase db = getReadableDatabase();
        Cursor cursor = db.query(TABLE, new String[]{"value"}, "key = ?",
                new String[]{key}, null, null, null);
        try {
            return cursor.moveToFirst() ? cursor.getString(0) : null;
        } finally {
            cursor.close();
        }
    }

    public synchronized void setItem(String key, String value) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put("key", key);
        values.put("value", value);
        db.insertWithOnConflict(TABLE, null, values, SQLiteDatabase.CONFLICT_REPLACE);
    }

    public synchronized void removeItem(String key) {
        SQLiteDatabase db = getWritableDatabase();
        db.delete(TABLE, "key = ?", new String[]{key});
    }
}
