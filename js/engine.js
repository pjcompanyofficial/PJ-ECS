let scanner;

async function startScanner() {
    const scanScreen = document.getElementById('scanner-screen');
    const initialScreen = document.getElementById('status-initial');
    const actionBtns = document.getElementById('footer-actions');

    scanScreen.classList.remove('hidden');
    initialScreen.classList.add('hidden');
    actionBtns.classList.add('hidden');

    scanner = new Html5Qrcode("reader");
    
    const config = { 
        fps: 25, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
    };

    try {
        await scanner.start(
            { facingMode: "environment" }, 
            config,
            (decodedText) => {
                scanner.stop();
                processData(decodedText);
            }
        );
    } catch (err) {
        alert("Camera Permission Required!");
        location.reload();
    }
}

function processData(scannedUrl) {
    try {
        const url = new URL(scannedUrl);
        const params = new URLSearchParams(url.search);
        
        if (params.has('n')) {
            document.getElementById('dispName').innerText = params.get('n');
            document.getElementById('dispDate').innerText = params.get('d');
            document.getElementById('dispAddr').innerText = params.get('a');
            document.getElementById('dispRef').innerText = params.get('r');
            document.getElementById('cardRefHeader').innerText = params.get('r');

            document.getElementById('scanner-screen').classList.add('hidden');
            document.getElementById('verified-display').classList.remove('hidden');
        } else {
            alert("Invalid QR: Data Format Not Supported.");
            location.reload();
        }
    } catch (e) {
        alert("Invalid Link Scanned.");
        location.reload();
    }
}

// Check for direct data in URL (Auto-mapping)
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('n')) {
        document.getElementById('status-initial').classList.add('hidden');
        document.getElementById('footer-actions').classList.add('hidden');
        processData(window.location.href);
    }
});
