# Publishing to CAKE.com Marketplace

After you've finished developing your app and have it running in a production environment, 
you can publish it on [CAKE.com Marketplace](https://marketplace.cake.com), to make it available on other Pumble workspaces.

To do so, you first need to create an account on CAKE.com Marketplace [developers portal](https://developer.marketplace.cake.com/signup).

After logging in to your developer account, go to `Create product add-on` and fill in the form to provide information necessary for app publishing (name, icon, manifest URL, visibility, category, description, gallery).
Make sure the value in the `Add-on name` input field matches the `name` property from app's manifest.
Your app's manifest will be served on this URL: 
```http
https://{APP_HOST_URL}/manifest
```

>[!NOTE]
> When publishing your app, please make sure to follow the [Publishing Guidelines and Best Practices](https://dev-docs.marketplace.cake.com/pumble/publish/publishing-and-guidelines.html).

## App visibility

Pumble apps can be published as `Public` or `Private`. 
`Public` apps are available to all Pumble workspaces for installation, while `Private` apps are only available to a given list of whitelisted workspaces.
If you wish to make you app `Public`, it needs to go through the review process before publishing, while a `Private` app can be published immediately.

Once the app is published, it is not possible to change its visibility.

## Updating the app

After you've published your app to CAKE.com Marketplace or submitted it for review, it won't be possible to update its manifest (the version that Pumble keeps) directly via Pumble anymore.
That means it won't be possible to call the [Update App endpoint](/manifest#updating-an-app) or to have `pumble-cli` watch manifest changes and automatically update it.
However, it will still be possible to modify the app functionality without any additional submissions to CAKE.com Marketplace, as long as it does not require any changes to the manifest.

If you want to modify the app's manifest and test the new behavior, it is recommended that you create a new, unpublished app which will be a clone of your exising app, and verify the behavior there.
After verifying that everything works as expected, you can re-deploy your app to production environment, with the manifest changes included.
At this point, the manifest changes will be visible on the URL where the manifest is served by `pumble-sdk`, they just won't be registered on Pumble yet.

To register the app's new manifest on Pumble, create a new version of you app via CAKE.com Marketplace [developers portal](https://developer.marketplace.cake.com).
In case your app is `Public`, it will need to go through the review process before publishing each new version, while that is not required for `Private` apps.

If your newly published app version requires additional scopes, users will automatically receive a message prompting them to reauthorize and approve the new scopes. 
However, it is recommended to keep the versions backward compatible, in case the users opt out of approving the new scopes.

## Deleting the app

In order to delete a published app, it is necessary to remove it from CAKE.com Marketplace first, via the [developers portal](https://developer.marketplace.cake.com).

After that, a `Public` app will first be unlisted for 30 days before removal. 
That means it will still be available on workspaces where it is installed, but it won't be possible to install it on other workspaces. 
On the other hand, a `Private` app will be removed from CAKE.com Marketplace and uninstalled from the workspaces immediately.

After an app has been removed from CAKE.com Marketplace, it is possible to permanently delete it from Pumble by calling the [Delete App endpoint](/manifest#delete-your-app).
