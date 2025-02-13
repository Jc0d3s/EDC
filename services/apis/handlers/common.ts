import type { IAppVersion } from "~/types/common";

export async function getClientVersion() {
    let versionDetails: IAppVersion | null = null;
    const versionResponse = await fetch("/version.json");
    const jsonResponse = await versionResponse.json();
    if (versionResponse.status === 200) {
        versionDetails = deepClone(jsonResponse);
    }
    return versionDetails;
}
