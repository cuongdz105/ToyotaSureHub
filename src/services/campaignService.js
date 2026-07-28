const STORAGE_KEY = "TSH_CAMPAIGNS";

export function loadCampaigns() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function saveCampaigns(campaigns) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

export function createCampaign(campaign) {
    const campaigns = loadCampaigns();

    campaigns.push(campaign);

    saveCampaigns(campaigns);

    return campaign;
}

export function updateCampaign(updatedCampaign) {

    const campaigns = loadCampaigns().map(c =>
        c.id === updatedCampaign.id ? updatedCampaign : c
    );

    saveCampaigns(campaigns);
}

export function deleteCampaign(id) {

    const campaigns = loadCampaigns().filter(c => c.id !== id);

    saveCampaigns(campaigns);
}