# -*- coding: utf-8 -*-
"""
日报/周报提交日志
共享模块，记录已提交的日报和周报，避免重复提交
"""
import json, os
from datetime import datetime

LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "submit_log.json")


def load_log():
    """加载提交日志"""
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"daily": {}, "weekly": {}}


def save_log(log):
    """保存提交日志"""
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(log, f, ensure_ascii=False, indent=2)


def is_daily_done(date_str):
    """检查某天日报是否已提交"""
    log = load_log()
    return date_str in log.get("daily", {})


def is_weekly_done(week_date):
    """检查某周周报是否已提交"""
    log = load_log()
    return week_date in log.get("weekly", {})


def mark_daily_done(date_str, status="ok"):
    """标记日报已提交"""
    log = load_log()
    log.setdefault("daily", {})[date_str] = {
        "status": status,
        "time": datetime.now().isoformat()
    }
    save_log(log)


def mark_weekly_done(week_date, status="ok"):
    """标记周报已提交"""
    log = load_log()
    log.setdefault("weekly", {})[week_date] = {
        "status": status,
        "time": datetime.now().isoformat()
    }
    save_log(log)


def get_pending_daily(all_dates):
    """从日期列表中筛选未提交的"""
    log = load_log()
    daily_log = log.get("daily", {})
    return [d for d in all_dates if d not in daily_log]


def get_pending_weekly(all_weeks):
    """从周列表中筛选未提交的"""
    log = load_log()
    weekly_log = log.get("weekly", {})
    return [w for w in all_weeks if w not in weekly_log]
