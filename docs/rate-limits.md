# Rate Limits

To ensure system stability and fair resource distribution for all users, our service
implements rate limiting. 

## Global limits

These limits determine the overall traffic allowed for your application, regardless of the number of users or specific endpoints accessed.
- Total App Requests: 3.000 total requests per minute window across your entire app.
- Limits per user: 1.000 requests per individual user, per minute. This limit applies to requests sent by your app on behalf of a specific user.

## Endpoint-Specific Limits

The following endpoints have additional constraints due to their impact on system performance and user experience. If an endpoint limit is stricter than the global limit, the stricter one applies.
- Send New Message: 80 requests per minute per app and workspace
- Send New Reply: 80 requests per minute per app and workspace
- Create Public or Private Channel: 60 requests per minute per app and workspace
- Add Message Reaction: 60 requests per minute per app and workspace
- Schedule Message: 60 requests per minute per app and workspace
- Publish Home View: 20 requests per minute per app and user

## Rate Limit Exceeded
When your application or a specific user exceeds the allocated quota, the server will return a 429 Too Many Requests error.