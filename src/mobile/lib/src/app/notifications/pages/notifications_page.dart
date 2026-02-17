import 'package:flutter/material.dart';

class NotificationItem {
  final String title;
  final String message;

  NotificationItem({
    required this.title,
    required this.message,
  });
}

class NotificationsScreen extends StatelessWidget {
  final List<NotificationItem> notifications = [
    NotificationItem(
      title: 'Welcome to AirQo!',
      message: 'Begin your journey to Knowing Your Air and Breathe Clean...',
    ),
    NotificationItem(
      title: 'Welcome to AirQo!',
      message: 'Begin your journey to Knowing Your Air and Breathe Clean...',
    ),
    NotificationItem(
      title: 'Welcome to AirQo!',
      message: 'Begin your journey to Knowing Your Air and Breathe Clean...',
    ),
    NotificationItem(
      title: 'Welcome to AirQo!',
      message: 'Begin your journey to Knowing Your Air and Breathe Clean...',
    ),
    NotificationItem(
      title: 'Welcome to AirQo!',
      message: 'Begin your journey to Knowing Your Air and Breathe Clean...',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: LayoutBuilder(
        builder: (context, constraints) {
          double maxWidth = constraints.maxWidth;
          double maxHeight = constraints.maxHeight;

          return ListView.builder(
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final notification = notifications[index];
              return Padding(
                padding: const EdgeInsets.all(8.0),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[900],
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: ListTile(
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: maxWidth * 0.05,
                      vertical: maxHeight * 0.02,
                    ),
                    leading: Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: maxWidth * 0.03,
                        vertical: maxHeight * 0.01,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(4.0),
                      ),
                      child: Text(
                        'New',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: maxWidth * 0.04,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    title: Text(
                      notification.title,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: maxWidth * 0.05,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    subtitle: Text(
                      notification.message,
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: maxWidth * 0.04,
                      ),
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
