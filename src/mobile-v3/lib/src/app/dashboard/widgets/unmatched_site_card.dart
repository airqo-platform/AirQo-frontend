import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';

class UnmatchedSiteCard extends StatefulWidget {
  final SelectedSite site;
  final Function(String) onRemove;

  const UnmatchedSiteCard({
    required this.site,
    required this.onRemove,
    super.key,
  });

  @override
  State<UnmatchedSiteCard> createState() => _UnmatchedSiteCardState();
}

class _UnmatchedSiteCardState extends State<UnmatchedSiteCard> {
  double _dragOffset = 0;
  final double _deleteWidth = 80.0;
  bool _isDeleteVisible = false;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            onTap: () {
              if (_dragOffset < 0) {
                widget.onRemove(widget.site.id);
              }
            },
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Align(
                alignment: Alignment.centerRight,
                child: Padding(
                  padding: const EdgeInsets.only(right: 20),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.delete,
                        color: Colors.white,
                        size: 24,
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Remove',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        GestureDetector(
          onHorizontalDragStart: (details) {},
          onHorizontalDragUpdate: (details) {
            if (details.delta.dx < 0 || _dragOffset < 0) {
              setState(() {
                _dragOffset += details.delta.dx;
                if (_dragOffset < -_deleteWidth) {
                  _dragOffset = -_deleteWidth;
                } else if (_dragOffset > 0) {
                  _dragOffset = 0;
                }
              });
            }
          },
          onHorizontalDragEnd: (details) {
            if (_dragOffset < -_deleteWidth / 2) {
              widget.onRemove(widget.site.id);
              _dragOffset = 0;       
              _isDeleteVisible = false;
              setState(() {});
            }
          },
          child: Transform.translate(
            offset: Offset(_dragOffset, 0),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Theme.of(context).highlightColor,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(
                        left: 16, right: 16, bottom: 16, top: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    widget.site.searchName.isNotEmpty 
                                        ? widget.site.searchName 
                                        : widget.site.name,
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: Theme.of(context)
                                          .textTheme
                                          .headlineSmall
                                          ?.color,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  if (widget.site.searchName.isNotEmpty && 
                                      widget.site.name != widget.site.searchName)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 4),
                                      child: Text(
                                        widget.site.name,
                                        style: TextStyle(
                                          fontSize: 14,
                                          color: Colors.grey.shade600,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade400,
                      borderRadius: BorderRadius.only(
                        bottomLeft: Radius.circular(12),
                        bottomRight: Radius.circular(12),
                      ),
                    ),
                    padding: const EdgeInsets.only(
                        left: 16, right: 16, bottom: 16, top: 4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    SvgPicture.asset(
                                      Theme.of(context).brightness == Brightness.light
                                          ? "assets/images/shared/pm_rating_white.svg"
                                          : 'assets/images/shared/pm_rating.svg'
                                    ),
                                    const SizedBox(width: 2),
                                    Text(
                                      " PM2.5",
                                      style: TextStyle(
                                        color: Theme.of(context).brightness == Brightness.dark
                                            ? Colors.black
                                            : Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                                Row(
                                  children: [
                                    Text(
                                      "---",
                                      style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 36,
                                        color: Theme.of(context).brightness == Brightness.dark
                                            ? Colors.black
                                            : Colors.white,
                                      ),
                                    ),
                                    Text(
                                      " μg/m³",
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 18,
                                        color: Theme.of(context).brightness == Brightness.dark
                                            ? Colors.black
                                            : Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            SizedBox(
                              child: Center(
                                child: SvgPicture.asset(
                                  "assets/images/shared/airquality_indicators/unavailable.svg",
                                  height: 60,
                                  width: 60,
                                  colorFilter: ColorFilter.mode(
                                    Theme.of(context).brightness == Brightness.dark
                                        ? Colors.black.withOpacity(0.5)
                                        : Colors.white.withOpacity(0.5),
                                    BlendMode.srcIn,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 16),
                        Wrap(
                          children: [
                            Container(
                              margin: EdgeInsets.only(bottom: 12),
                              padding: EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade600,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                "---",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}