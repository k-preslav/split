let launchTracked = false;

export const isAppLaunchTracked = () => launchTracked;
export const markAppLaunchTracked = () => { launchTracked = true };
export const unmarkAppLaunchTracked = () => { launchTracked = false };