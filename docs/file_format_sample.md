# サンプルプロジェクト

## プロセスフロー図

```mermaid
graph LR
    task_1[要件定義<br/>完了 | 高]
    task_2[設計<br/>進行中 | 高]
    task_3[実装<br/>未開始 | 中]
    task_4[テスト<br/>未開始 | 中]
    deliverable_1{要件定義書<br/>完成}
    deliverable_2{設計書<br/>準備中}
    deliverable_3{ソフトウェア<br/>準備中}

    task_1 --> deliverable_1
    deliverable_1 --> task_2
    task_2 --> deliverable_2
    deliverable_2 --> task_3
    task_3 --> deliverable_3
    deliverable_3 --> task_4
```

## プロジェクト詳細データ

```json
{
  "version": "1.0",
  "exportDate": "2025-10-05T12:00:00Z",
  "project": {
    "id": 1,
    "name": "サンプルプロジェクト",
    "description": "プロジェクト管理アプリの開発プロジェクト",
    "created_at": "2025-10-01T00:00:00Z"
  },
  "tasks": [
    {
      "id": 1,
      "name": "要件定義",
      "description": "プロジェクトの要件を定義する",
      "status": "completed",
      "priority": "high",
      "start_date": "2025-10-01",
      "end_date": "2025-10-05",
      "duration_days": 5,
      "position_x": 150,
      "position_y": 100
    },
    {
      "id": 2,
      "name": "設計",
      "description": "システム設計を行う",
      "status": "in_progress",
      "priority": "high",
      "start_date": "2025-10-06",
      "end_date": "2025-10-12",
      "duration_days": 7,
      "position_x": 400,
      "position_y": 100
    },
    {
      "id": 3,
      "name": "実装",
      "description": "コーディングを行う",
      "status": "not_started",
      "priority": "medium",
      "start_date": null,
      "end_date": null,
      "duration_days": 10,
      "position_x": 650,
      "position_y": 100
    },
    {
      "id": 4,
      "name": "テスト",
      "description": "品質検証を行う",
      "status": "not_started",
      "priority": "medium",
      "start_date": null,
      "end_date": null,
      "duration_days": 5,
      "position_x": 900,
      "position_y": 100
    }
  ],
  "deliverables": [
    {
      "id": 1,
      "name": "要件定義書",
      "description": "プロジェクト要件をまとめたドキュメント",
      "type": "document",
      "status": "completed",
      "due_date": "2025-10-05",
      "position_x": 275,
      "position_y": 300
    },
    {
      "id": 2,
      "name": "設計書",
      "description": "システム設計ドキュメント",
      "type": "design",
      "status": "not_ready",
      "due_date": "2025-10-12",
      "position_x": 525,
      "position_y": 300
    },
    {
      "id": 3,
      "name": "ソフトウェア",
      "description": "実装されたアプリケーション",
      "type": "software",
      "status": "not_ready",
      "due_date": "2025-10-25",
      "position_x": 775,
      "position_y": 300
    }
  ],
  "connections": [
    {
      "source_type": "task",
      "source_id": 1,
      "target_type": "deliverable",
      "target_id": 1
    },
    {
      "source_type": "deliverable",
      "source_id": 1,
      "target_type": "task",
      "target_id": 2
    },
    {
      "source_type": "task",
      "source_id": 2,
      "target_type": "deliverable",
      "target_id": 2
    },
    {
      "source_type": "deliverable",
      "source_id": 2,
      "target_type": "task",
      "target_id": 3
    },
    {
      "source_type": "task",
      "source_id": 3,
      "target_type": "deliverable",
      "target_id": 3
    },
    {
      "source_type": "deliverable",
      "source_id": 3,
      "target_type": "task",
      "target_id": 4
    }
  ]
}
```
