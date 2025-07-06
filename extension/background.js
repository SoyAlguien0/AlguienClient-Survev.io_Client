function update_redirect_rule(filter) {
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1],
        addRules: [{
            id: 1,
            priority: 1,
            action: {
                type: "redirect",
                redirect: {
                    url: "https://soyalguien0.github.io/AlguienClient-Survev.io_Client/AlguienClient.js"
                }
            },
            condition: {
                urlFilter: filter,
                resourceTypes: ["script"],
                domains: ["survev.io"]
            }
        }]
    });
}

async function get_filename_from_storage() {
    return (await chrome.storage.local.get("filename")).filename;
}

async function save_filename_to_storage(new_filename) {
    return (await chrome.storage.local.set({"filename": new_filename}));
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    get_filename_from_storage().then((old_filename) => {
        const new_filename = message["filename"];
        const filename_modified = old_filename !== new_filename;
    
        if (filename_modified) {
            save_filename_to_storage(new_filename);
    
            const filter = new_filename.split('/').pop();
            update_redirect_rule(filter);
    
            console.log("Update filter to:", filter);
        }
    
        sendResponse({ "filename_modified": filename_modified });
    });
    return true;
});
