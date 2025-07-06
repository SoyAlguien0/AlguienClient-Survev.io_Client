function get_script_filename() {
    const script = document.querySelector("head > script:nth-child(24)");
    return (script ? script.src : "");
}

(() => {
    const script_filename = get_script_filename();
    if (!script_filename) return;

    console.log("Script filename:", script_filename);

    chrome.runtime.sendMessage({ filename: script_filename }, ({ filename_modified }) => {
        if (filename_modified) {
            // Prevent original script load before redirect rule updated
            location.reload(true); 
        }
    });
})()