# Amplify & AgentCore CDKテンプレ

AWSの最新機能をフルに生かした、フルスタックのAIエージェントWebアプリを簡単にデプロイできます。

![画面イメージ](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1633856/109a3b02-b137-49e9-9b37-2dfc49481a4e.png)

特徴

- フルサーバーレスなので維持費激安。ほぼLLMのAPI料金のみで運用できます。
- エンプラReadyなセキュリティ。Cognito認証付き、東京リージョン対応。WAFでIP制限もできます。


### アーキテクチャ

- フロントエンド： React + Vite
- バックエンド： Bedrock AgentCoreランタイム
- インフラ： Amplify Gen2 + AWS CDK

![アーキテクチャ](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1633856/8792ff3f-0db0-4f23-9d87-7d4d995d6bb5.png)


### デプロイ手順

1. このリポジトリを自分のGitHubアカウントにフォーク
2. Amplify Gen2にリポジトリのURLを登録

→ これだけで自動的にフロントエンド＆バックエンドがデプロイされます。


### 便利なTips

- `npx ampx sandbox` でローカル開発用の占有インフラを一時デプロイできます。
- `dev` など新しいブランチをAmplifyにプッシュすると、検証環境などを簡単に増やせます。