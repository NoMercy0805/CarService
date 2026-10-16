package com.schiwy.carservice;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Calendar;
import java.util.Locale;

public class ReminderReceiver extends BroadcastReceiver {
    static final String PREFS = "reminder_prefs";
    static final String KEY_DATA = "reminder_data";
    static final String CHANNEL_ID = "carservice_due_reminders";
    private static final int REQUEST_CODE = 8891;
    private static final long THREE_DAYS_MS = 3L * 24L * 60L * 60L * 1000L;

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent == null ? null : intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)) {
            schedule(context);
        }
        checkNow(context);
    }

    public static void schedule(Context context) {
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) return;
            Intent intent = new Intent(context, ReminderReceiver.class);
            intent.setAction("com.schiwy.carservice.CHECK_REMINDERS");
            PendingIntent pi = PendingIntent.getBroadcast(
                    context,
                    REQUEST_CODE,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            Calendar next = Calendar.getInstance();
            next.set(Calendar.HOUR_OF_DAY, 10);
            next.set(Calendar.MINUTE, 0);
            next.set(Calendar.SECOND, 0);
            next.set(Calendar.MILLISECOND, 0);
            if (next.getTimeInMillis() <= System.currentTimeMillis()) {
                next.add(Calendar.DAY_OF_YEAR, 1);
            }

            alarmManager.setInexactRepeating(
                    AlarmManager.RTC_WAKEUP,
                    next.getTimeInMillis(),
                    AlarmManager.INTERVAL_DAY,
                    pi);
        } catch (Exception ignored) {}
    }

    public static void checkNow(Context context) {
        if (Build.VERSION.SDK_INT >= 33
                && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String raw = prefs.getString(KEY_DATA, null);
        if (raw == null || raw.trim().isEmpty()) return;

        ensureChannel(context);

        try {
            JSONArray items = new JSONArray(raw);
            LocalDate today = LocalDate.now();
            long now = System.currentTimeMillis();
            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.optJSONObject(i);
                if (item == null) continue;
                String type = item.optString("type", "");
                String vehicleId = item.optString("vehicleId", "");
                String vehicle = item.optString("vehicle", "Fahrzeug");
                String dueText = item.optString("dueDate", "");
                if (type.isEmpty() || dueText.isEmpty()) continue;
                if (!prefs.getBoolean("enabled_" + type, true)) continue;

                LocalDate due;
                try { due = LocalDate.parse(dueText); }
                catch (Exception e) { continue; }

                long days = ChronoUnit.DAYS.between(today, due);
                if (days > 30) continue;

                String uniqueKey = type + "_" + vehicleId + "_" + dueText;
                long last = prefs.getLong("last_" + uniqueKey, 0L);
                if (last > 0 && now - last < THREE_DAYS_MS) continue;

                showNotification(context, type, vehicle, due, days, uniqueKey.hashCode());
                prefs.edit().putLong("last_" + uniqueKey, now).apply();
            }
        } catch (Exception ignored) {}
    }

    private static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) return;
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Fällige Termine",
                NotificationManager.IMPORTANCE_DEFAULT);
        channel.setDescription("Erinnerungen für Service, TÜV / HU und Verbandskasten");
        manager.createNotificationChannel(channel);
    }

    private static void showNotification(Context context, String type, String vehicle,
                                         LocalDate due, long days, int notificationId) {
        Intent open = new Intent(context, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
                context,
                notificationId,
                open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        String title;
        String subject;
        if ("service".equals(type)) {
            title = days < 0 ? "Service überfällig" : "Service bald fällig";
            subject = "Service";
        } else if ("hu".equals(type)) {
            title = days < 0 ? "TÜV / HU überfällig" : "TÜV / HU bald fällig";
            subject = "TÜV / HU";
        } else {
            title = days < 0 ? "Verbandskasten abgelaufen" : "Verbandskasten läuft bald ab";
            subject = "Verbandskasten";
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy", Locale.GERMANY);
        String body;
        if (days < 0) {
            long overdue = Math.abs(days);
            body = vehicle + ": " + subject + " seit " + overdue + (overdue == 1 ? " Tag" : " Tagen")
                    + " überfällig (" + due.format(formatter) + ").";
        } else if (days == 0) {
            body = vehicle + ": " + subject + " ist heute fällig.";
        } else {
            body = vehicle + ": " + subject + " in " + days + (days == 1 ? " Tag" : " Tagen")
                    + " fällig (" + due.format(formatter) + ").";
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setAutoCancel(true)
                .setContentIntent(contentIntent);

        try {
            NotificationManagerCompat.from(context).notify(notificationId, builder.build());
        } catch (SecurityException ignored) {}
    }
}
