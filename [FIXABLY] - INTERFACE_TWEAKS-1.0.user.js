// ==UserScript==
// @name         [FIXABLY] - INTERFACE_TWEAKS
// @version      1.0
// @description  Reorganizacja interfejsu na modłe SERVO + kilka zmian quality of life
// @author       Sebastian Zborowski - https://github.com/sebastian-zborowski
// @match        https://ispot.fixably.com/*
// @exclude      https://ispot.fixably.com/pl/orders/*/print/*
// @updateURL    https://raw.githubusercontent.com/sebastian-zborowski/fixably_-_interface_tweaks/main/%5BFIXABLY%5D%20-%20INTERFACE_TWEAKS-1.0.user.js
// @downloadURL  https://raw.githubusercontent.com/sebastian-zborowski/fixably_-_interface_tweaks/main/%5BFIXABLY%5D%20-%20INTERFACE_TWEAKS-1.0.user.js
// @grant        none
// @source       https://github.com/sebastian-zborowski
// ==/UserScript==

//Disclaimer:
//Niniejszy skrypt został utworzony metodą Vibecodingu. Nie ingeruje trwale w oryginalne strony internetowe, nie odwołuje się do danych prywatnych ani chronionych przepisami RODO,
//nie przetwarza danych osobowych, a także nie zmienia podstawowego działania strony. Skrypt dodaje kilka automatyzacji, skrótów oraz modyfikacje wizualne, które mają na celu
//usprawnienie i ułatwienie korzystania z serwisu.

//Ostatni update: 31.07.2025 

(function () {
    'use strict';


// Kontrola wersji alert ---------------------------------------------------------
    const SCRIPT_NAME = 'INTERFACE_TWEAKS';
    const CURRENT_VERSION = '1.0';
// -------------------------------------------------------------------------------

    function safeGetLocalStorage(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('localStorage.getItem failed:', e);
            return null;
        }
    }

    function safeSetLocalStorage(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('localStorage.setItem failed:', e);
        }
    }

    function createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'white',
            color: '#333',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            zIndex: '9999999',
            userSelect: 'none',
            overflow: 'hidden',
        });

        const backgroundImg = document.createElement('img');
        backgroundImg.src = 'https://i.postimg.cc/vBnKGKk5/servo-MODfinal.jpg';
        Object.assign(backgroundImg.style, {
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-25deg)',
            width: '40%',
            opacity: '0.25',
            zIndex: '0',
            pointerEvents: 'none',
        });
        backgroundImg.style.setProperty('-webkit-mask-image', 'radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)');

        overlay.appendChild(backgroundImg);

        const logoImg = document.createElement('img');
        logoImg.src = 'https://static.fixably.com/img/fixably-logo-white.svg';
        logoImg.alt = 'Fixably logo';
        Object.assign(logoImg.style, {
            width: '20%',
            filter: 'invert(1)',
            zIndex: '1',
            position: 'relative',
        });

        const loadingText = document.createElement('div');
        loadingText.textContent = 'WCZYTYWANIE';
        Object.assign(loadingText.style, {
            fontSize: '36px',
            fontWeight: 'bold',
            color: 'black',
            zIndex: '1',
            position: 'relative',
        });

        const loadingGif = document.createElement('img');
        loadingGif.src = 'https://i.gifer.com/ZZ5H.gif';
        loadingGif.alt = 'Loading spinner';
        Object.assign(loadingGif.style, {
            width: '50px',
            height: '50px',
            objectFit: 'contain',
            zIndex: '1',
            position: 'relative',
        });

        overlay.appendChild(logoImg);
        overlay.appendChild(loadingText);
        overlay.appendChild(loadingGif);

        return overlay;
    }

    function forceReloadIfLoadingOverlayTooLong(timeout = 5000) {
        setTimeout(() => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                console.warn('Loading overlay trwa dłużej niż 5s - wymuszam przeładowanie strony');
                location.reload();
            }
        }, timeout);
    }

    function isServoModeOn() {
        return safeGetLocalStorage('SERVOMODE') === '1';
    }

    function shouldShowLoadingOverlay() {
        const path = location.pathname.toLowerCase();
        return isServoModeOn() && isPreloaderOn() && (path.includes('/orders') || path.includes('/repair'));
    }

    function shouldModifyInterface() {
        const path = location.pathname.toLowerCase();
        return isServoModeOn() && (path.includes('/orders') || path.includes('/repair'));
    }


    function swapElements() {
        const parent = document.querySelector('.row');
        const orderBody = document.getElementById('order-body');
        const outerDiv = document.getElementById('outer-div');

        if (parent && orderBody && outerDiv && orderBody.previousElementSibling !== outerDiv) {
            parent.insertBefore(outerDiv, orderBody);
        }

        const orderDevice = document.getElementById('order-device');
        const topPanel = document.querySelector('.panel.panel-default.top-panel');

        if (orderDevice && topPanel && topPanel.parentNode && orderDevice.nextSibling !== topPanel) {
            topPanel.parentNode.insertBefore(orderDevice, topPanel);
        }

        if (safeGetLocalStorage('FLIPPARTS') === '1') {
            const items = document.getElementById('order-items');
            const timeline = document.getElementById('order-timeline');
            if (orderBody && items && timeline && items.nextElementSibling === timeline) {
                orderBody.insertBefore(timeline, items);
            }
        }
    }

    function injectServoToggle() {
        const targetRow = [...document.querySelectorAll('.row')].find(
            row => row.style.height === '22px' && row.style.marginTop === '1px'
        );
        if (!targetRow) return;

        const leftCol = targetRow.querySelector('.col-xs-6');
        if (!leftCol) return;

        // Ustaw flex i wyśrodkowanie pionowe na rodzicu
        leftCol.style.display = 'flex';
        leftCol.style.alignItems = 'center';
        leftCol.style.height = '22px';

        if (!document.getElementById('fixably-toggle-style')) {
            const style = document.createElement('style');
            style.id = 'fixably-toggle-style';
            style.textContent = `
#toggle-controls-container {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-left: 15px;
  font-family: Arial, sans-serif;
}

.toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-label-text {
  font-size: 16px;
  line-height: 22px;
  user-select: none;
  color: #222;
  white-space: nowrap;
}

.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 22px;
  cursor: pointer;
  vertical-align: middle;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.slider {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  border-radius: 22px;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

.switch input:checked + .slider {
  background-color: #2196F3;
}

.switch input:checked + .slider:before {
  transform: translateX(20px);
}
        `;
            document.head.appendChild(style);
        }

        function createToggle(id, labelText, storageKey, tooltipText, defaultOn = false) {
            const wrapper = document.createElement('div');
            wrapper.className = 'toggle-wrapper';

            const textLabel = document.createElement('span');
            textLabel.className = 'toggle-label-text';
            textLabel.textContent = labelText;
            textLabel.title = tooltipText;

            const label = document.createElement('label');
            label.className = 'switch';
            label.title = tooltipText;

            const toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.id = id;

            let storedValue = safeGetLocalStorage(storageKey);
            if (storedValue === null && defaultOn) {
                storedValue = '1';
                safeSetLocalStorage(storageKey, '1');
            }
            toggle.checked = storedValue === '1';
            toggle.title = tooltipText;

            const slider = document.createElement('span');
            slider.className = 'slider';

            toggle.addEventListener('change', function () {
                safeSetLocalStorage(storageKey, this.checked ? '1' : '0');
                location.reload();
            });

            label.appendChild(toggle);
            label.appendChild(slider);

            wrapper.appendChild(textLabel);
            wrapper.appendChild(label);

            return wrapper;
        }

        const oldContainer = document.getElementById('toggle-controls-container');
        if (oldContainer) oldContainer.remove();

        const container = document.createElement('div');
        container.id = 'toggle-controls-container';

        const servoTooltip = 'Reorganizuje interfejs Fixably tak aby bardziej przypominał ten z SERVO.';
        const servoToggle = createToggle('servo-toggle', 'SERVO-MOD', 'SERVOMODE', servoTooltip);
        container.appendChild(servoToggle);

        if (servoToggle.querySelector('input').checked) {
            const flipTooltip = 'Zamienia miejscami komentarze i części, w zależności od preferencji Serwisanta.';
            const flipToggle = createToggle('flip-toggle', 'COMM-PART', 'FLIPPARTS', flipTooltip);
            container.appendChild(flipToggle);
            //Ta funkcjonalnośc nie jest jeszcze gotowa
            //const preloaderTooltip = 'Włącza lub wyłącza nakładkę ładowania (preloader) na stronach zamówień i napraw.';
            //onst preloaderToggle = createToggle('preloader-toggle', 'PRELOADER', 'PRELOADER', preloaderTooltip, true);
            //container.appendChild(preloaderToggle);
        }

        leftCol.appendChild(container);
    }

    function waitForOrderDeviceContainer(callback, timeout = 10000) {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const container = document.getElementById('order_device_container');
            const serialSpan = document.querySelector('span.copy-to-clipboard[data-copy]');
            if (container && serialSpan) {
                clearInterval(interval);
                callback();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                console.warn('Timeout: #order_device_container lub serialSpan');
            }
        }, 200);
    }

    function waitForElement(selector, callback, timeout = 10000) {
        const start = Date.now();
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                callback();
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                console.warn('Timeout:', selector);
            }
        }, 200);
    }

    function minimizeComments() {
        const commentPanels = document.querySelectorAll('.timeline-panel');
        commentPanels.forEach(panel => {
            //panel.style.maxHeight = '';
            //panel.style.overflow = '';
            panel.style.fontSize = '12px';
            panel.style.padding = '4px 6px';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            waitForElement('.timeline-panel', minimizeComments);
        });
    } else {
        waitForElement('.timeline-panel', minimizeComments);
    }

    function addGsxLink() {
        const serialSpan = document.querySelector('span.copy-to-clipboard[data-copy]');
        if (!serialSpan) return;

        const serial = serialSpan.getAttribute('data-copy');
        if (!serial || document.getElementById('gsx-link') || document.getElementById('ast2-link')) return;

        const dt = serialSpan.closest('dt');
        const dd = dt?.nextElementSibling;
        if (!dd || dd.tagName.toLowerCase() !== 'dd') return;

        const gsx = document.createElement('a');
        gsx.href = `https://gsx2.apple.com/product-details/${serial}`;
        gsx.target = '_blank';
        gsx.textContent = '[GSX]';
        gsx.id = 'gsx-link';
        gsx.style.marginLeft = '8px';
        gsx.style.fontSize = '11px';

        dd.appendChild(gsx);

        const ast = document.createElement('a');
        ast.href = `https://diagnostics.apple.com/?serial=${serial}`;
        ast.target = '_blank';
        ast.textContent = '[AST2]';
        ast.id = 'ast2-link';
        ast.style.marginLeft = '8px';
        ast.style.fontSize = '11px';

        dd.appendChild(ast);
    }

    function addGoodsReceiveLink() {
        const targetLink = document.querySelector('a.editable.editable-click.text-danger[data-name="serial"]');
        if (
            !targetLink ||
            document.getElementById('goods-receive-link') ||
            targetLink.textContent.trim() !== 'Add Known Good Board (KGB)'
        ) return;

        const link = document.createElement('a');
        link.href = 'https://ispot.fixably.com/pl/goods/receive';
        link.textContent = '[Przyjmij KGB]';
        link.id = 'goods-receive-link';
        link.style.marginLeft = '6px';
        link.style.fontSize = '12px';
        link.style.color = '#007bff';

        targetLink.insertAdjacentElement('afterend', link);
    }

    function highlightWarrantyAndSerial() {
        const dtElements = document.querySelectorAll('#order_device_container dt');
        dtElements.forEach(dt => {
            const text = dt.textContent.trim().toUpperCase();
            const dd = dt.nextElementSibling;
            if (!dd || dd.tagName.toLowerCase() !== 'dd') return;

            if (text.includes('WARRANTY') || text.includes('GWARANCJA')) {
                dd.style.fontWeight = 'bold';
                dd.style.fontSize = '13px';
                dd.style.color = '#1c5f00';
            }

            if (text === 'SERIAL NUMBER' || text === 'NUMER SERYJNY') {
                dd.style.fontWeight = 'bold';
                dd.style.fontSize = '14px';
                dd.style.color = '#333';
            }
        });
    }

    function flattenTimelineRows() {
        const rows = document.querySelectorAll('li.timeline-filter-row');
        rows.forEach(row => {
            row.style.padding = '2px 5px';
            row.style.marginBottom = '2px';
            row.style.lineHeight = '1.1';
            row.style.fontSize = '12px';

            const time = row.querySelector('.timeline-time');
            if (time) time.style.fontSize = '11px';

            const badge = row.querySelector('.timeline-badge');
            if (badge) {
                badge.style.width = '18px';
                badge.style.height = '18px';
                badge.style.fontSize = '12px';
            }

            const panel = row.querySelector('.timeline-panel');
            if (panel) {
                panel.style.padding = '4px 6px';
            }
        });
    }

    function insertUniqueLabelsIntoOrderDevice() {
        const orderDevice = document.getElementById('order-device');
        if (!orderDevice) return;

        let wrapperDiv = orderDevice.querySelector('#labels-wrapper');
        if (!wrapperDiv) {
            wrapperDiv = document.createElement('div');
            wrapperDiv.id = 'labels-wrapper';
            wrapperDiv.style.borderBottom = '15px solid transparent';
            wrapperDiv.style.display = 'flex';
            wrapperDiv.style.flexWrap = 'wrap';
            wrapperDiv.style.marginBottom = '15px';
            orderDevice.appendChild(wrapperDiv);
        }

        const allLabels = Array.from(document.querySelectorAll('span.label.label-primary'));
        for (const label of allLabels) {
            const cloned = label.cloneNode(true);
            Object.assign(cloned.style, {
                margin: '3px 3px',
                display: 'inline-block',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                boxSizing: 'border-box'
            });
            wrapperDiv.appendChild(cloned);
        }

        const seenTexts = new Set();
        Array.from(wrapperDiv.querySelectorAll('span.label.label-primary')).forEach(child => {
            const text = child.textContent.trim().toLowerCase();
            if (seenTexts.has(text)) {
                child.remove();
            } else {
                seenTexts.add(text);
            }
        });
    }

    function removeLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }

    function isPreloaderOn() {
        const val = safeGetLocalStorage('PRELOADER');
        if (val === null) {
            safeSetLocalStorage('PRELOADER', '0');
            return true;
        }
        return val === '1';
    }

    function initPage() {
        const overlayExists = !!document.getElementById('loading-overlay');

        if (shouldShowLoadingOverlay()) {
            if (!overlayExists) {
                document.body.appendChild(createLoadingOverlay());
                forceReloadIfLoadingOverlayTooLong(7000);
            }
        } else if (overlayExists) {
            removeLoadingOverlay();
        }

        if (shouldModifyInterface()) {
            swapElements();

            waitForOrderDeviceContainer(() => {
                waitForElement('span.copy-to-clipboard[data-copy]', () => {
                    flattenTimelineRows();
                    addGsxLink();
                    highlightWarrantyAndSerial();
                    insertUniqueLabelsIntoOrderDevice();
                    removeLoadingOverlay();
                });
            });

            waitForElement('a.editable.editable-click.text-danger[data-name="serial"]', addGoodsReceiveLink);

        }
    }

    function setupUrlHooks() {
        function hookHistoryMethod(method) {
            const original = history[method];
            return function () {
                const result = original.apply(this, arguments);
                window.dispatchEvent(new Event('urlchange'));
                return result;
            };
        }

        history.pushState = hookHistoryMethod('pushState');
        history.replaceState = hookHistoryMethod('replaceState');

        window.addEventListener('urlchange', () => {
            const overlayExists = !!document.getElementById('loading-overlay');

            if (shouldShowLoadingOverlay()) {
                if (!overlayExists) {
                    document.body.appendChild(createLoadingOverlay());
                    forceReloadIfLoadingOverlayTooLong(5000);
                }
            } else if (overlayExists) {
                removeLoadingOverlay();
            }

            if (shouldModifyInterface()) {
                swapElements();

                waitForOrderDeviceContainer(() => {
                    waitForElement('span.copy-to-clipboard[data-copy]', () => {
                        flattenTimelineRows();
                        addGsxLink();
                        highlightWarrantyAndSerial();
                        insertUniqueLabelsIntoOrderDevice();
                        removeLoadingOverlay();
                    });
                });

                waitForElement('a.editable.editable-click.text-danger[data-name="serial"]', addGoodsReceiveLink);
            }
        });

        let lastPath = location.pathname;
        setInterval(() => {
            if (location.pathname !== lastPath) {
                lastPath = location.pathname;
                window.dispatchEvent(new Event('urlchange'));
            }
        }, 500);

        setupDomMutationObserver();
    }

    function setupDomMutationObserver() {
        const target = document.getElementById('main-content') || document.querySelector('.container');
        if (!target) return;

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (
                    mutation.type === 'childList' &&
                    mutation.removedNodes.length > 0 &&
                    target.children.length === 0
                ) {
                    console.warn('DOM content cleared, re-initializing...');
                    setTimeout(() => {
                        injectServoToggle();
                        initPage();
                    }, 100);
                    break;
                }
            }
        });

        observer.observe(target, {
            childList: true,
            subtree: false
        });
    }

    function setupGxsRepairInfoWatcher() {
        const orderId = getOrderId();
        if (!orderId) return;

        const reloadFlagKey = `gsxReloaded_${orderId}`;

        if (localStorage.getItem(reloadFlagKey) === 'true') return;

        if (document.getElementById('gsx_repair_info')) {
            localStorage.setItem(reloadFlagKey, 'true');
            console.warn(`🛠️ #gsx_repair_info już obecny dla ID ${orderId} — wymuszam reload`);
            location.reload();
            return;
        }

        const observer = new MutationObserver(() => {
            const found = document.getElementById('gsx_repair_info');
            if (found) {
                observer.disconnect();
                localStorage.setItem(reloadFlagKey, 'true');
                console.warn(`🛠️ Wykryto #gsx_repair_info dla ID ${orderId} — wymuszam reload`);
                location.reload();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        window.addEventListener('load', () => {
            localStorage.removeItem(reloadFlagKey);
        });

        function getOrderId() {
            const urlMatch = window.location.pathname.match(/\/orders\/(\d+)/);
            if (urlMatch) return urlMatch[1];

            const label = document.querySelector('#page-label span');
            if (label && /^\d+$/.test(label.textContent.trim())) {
                return label.textContent.trim();
            }

            return null;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectServoToggle();
            setupUrlHooks();
            setupGxsRepairInfoWatcher();
            initPage();
        });
    } else {
        injectServoToggle();
        setupUrlHooks();
        setupGxsRepairInfoWatcher();
        initPage();
    }


// Kontrola wersji alert ---------------------------------------------------------
(async function() {
    const scriptList = [
        { name: 'VERSION_CONTROL_SYSTEM', url: 'https://raw.githubusercontent.com/sebastian-zborowski/fixably_-_version-control-system/b2b6d4cbfe5cef3fcb98d3e23d79657ff9eae127/%5BFIXABLY%5D%20-%20VERSION%20CONTROL%20SYSTEM-1.0.user.js' },
        { name: 'PASTE_LINK', url: 'https://raw.githubusercontent.com/sebastian-zborowski/ast2_-_paste_link/main/%5BAST2%5D%20-%20PASTE_LINK-1.0.user.js' },
        { name: 'INTERFACE_TWEAKS', url: 'https://raw.githubusercontent.com/sebastian-zborowski/fixably_-_interface_tweaks/main/%5BFIXABLY%5D%20-%20INTERFACE_TWEAKS-1.0.user.js' },
        { name: 'PHOTO_PREVIEW', url: 'https://raw.githubusercontent.com/sebastian-zborowski/fixably_-_photo-preview/main/%5BFIXABLY%5D%20-%20PHOTO_PREVIEW-0.8.user.js' },
        { name: 'ACTION-REQUIRED', url: 'https://raw.githubusercontent.com/sebastian-zborowski/gsx_-_action_required/main/%5BGSX%5D%20-%20ACTION_REQUIRED-1.0.user.js' },
        { name: 'ADD_PARTS', url: 'https://raw.githubusercontent.com/sebastian-zborowski/gsx_-_add_parts/main/%5BGSX%5D%20-%20ADD_PARTS-1.0.user.js' },
    ];

    await Promise.all(scriptList.map(async script => {
        try {
            const res = await fetch(script.url);
            const text = await res.text();
            const match = text.match(/@version\s+([0-9.]+)/);
            if (match) {
                const version = match[1];
                localStorage.setItem(script.name, JSON.stringify({
                    name: script.name,
                    remote: version
                }));
                console.log(`[VERSION CONTROL] ${script.name}: ${version}`);
            } else {
                console.warn(`[VERSION CONTROL] Nie znaleziono wersji dla: ${script.name}`);
            }
        } catch (err) {
            console.warn(`[VERSION CONTROL] Błąd ładowania ${script.name}:`, err);
        }
    }));

    try {
        const storedStr = localStorage.getItem(SCRIPT_NAME);
        if (!storedStr) throw new Error('Brak danych w localStorage');

        const data = JSON.parse(storedStr);

        if (data?.remote && compareVersions(data.remote, CURRENT_VERSION) > 0) {
            showUpdatePopup(SCRIPT_NAME, CURRENT_VERSION, data.remote);
        }
    } catch (e) {
        console.warn(`[UPDATE CHECK] Błąd sprawdzania wersji dla ${SCRIPT_NAME}:`, e);
    }

    function compareVersions(v1, v2) {
        const split1 = v1.split('.').map(Number);
        const split2 = v2.split('.').map(Number);
        const length = Math.max(split1.length, split2.length);
        for (let i = 0; i < length; i++) {
            const a = split1[i] || 0;
            const b = split2[i] || 0;
            if (a > b) return 1;
            if (a < b) return -1;
        }
        return 0;
    }

    function showUpdatePopup(scriptName, current, remote) {
        const popup = document.createElement('div');
        popup.textContent = `🔔 Aktualizacja dostępna dla ${scriptName}: ${remote} (masz ${current})`;
        Object.assign(popup.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#222',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: 9999,
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            userSelect: 'none',
        });

        popup.addEventListener('click', () => popup.remove());

        document.body.appendChild(popup);

        setTimeout(() => popup.remove(), 15000);
    }
})();
// ---------------------------------------------------------------------------------

})();
