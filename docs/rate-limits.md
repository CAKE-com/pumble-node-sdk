# Rate Limits

To ensure system stability and fair resource distribution for all users, our service
implements rate limiting. 

## Global limits

These limits determine the overall traffic allowed for your application, regardless of the number of users or specific endpoints accessed.
- Total App Requests: 9.000 total requests per hour window across your entire app.
- Limits per user: 3.600 requests per individual user, per hour. This limit applies to requests sent by your app on behalf of a specific user.

## Endpoint-Specific Limits

The following endpoints have additional constraints due to their impact on system performance and user experience. If an endpoint limit is stricter than the global limit, the stricter one applies.
- Send New Message: 80 requests per minute per app
- Send New Reply: 80 requests per minute per app
- Create Public or Private Channel: 30 requests per minute per app
- Add Message Reaction: 50 requests per minute per app
- Schedule Message: 50 requests per minute per app
- Publish Home View: 60 requests per minute per app

## Rate Limit Exceeded
When your application or a specific user exceeds the allocated quota, the server will return a 429 Too Many Requests error.