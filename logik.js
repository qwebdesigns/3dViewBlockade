import * as THREE from 'three';
import {
    OBJLoader
} from 'three/addons/loaders/OBJLoader.js';
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';

var jsonData;
var skinsData;
var shareValue;
Toastify({
    text: "Идет загрузка данных...",
    duration: 1500,
    close: true
}).showToast();
$(document).ready(function () {
    var spreadsheetId = '1NYl838ERKhx42vrycL6bKxxWEpWwCbFW1OFQ0ePGrw0';
    var apiKey = 'AIzaSyAUIMhDDRWdIkqP1DhPVXlp0QN6AawIQ04';
    var sheetName = 'DataList';
    var column = 'D';
    // Получение "глубины" столбца D
    var depthUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!${column}:${column}?key=${apiKey}`;
    $.get(depthUrl, function (response) {
        var depth = response.values.length;
        // Формирование диапазона
        var range = `${sheetName}!A2:I${depth + 1}`;
        var dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
        // Получение данных
        $.get(dataUrl, function (response) {
            var values = response.values;
            // Преобразование данных в формат JSON
            jsonData = values.map(row => ({
                'Name': row[0],
                'Series': row[1],
                'Price': row[2],
                'TypeClaim': row[3],
                'ResistBust': row[4],
                'OtherBust': row[5],
                'Image': row[6],
                'Badge': row[7],
                'TextureName': row[8]
            }));
            //console.table(jsonData);
        });
    });
    setTimeout(function () {
        Toastify({
            text: "Данные успешно загружены!",
            duration: 2000,
            close: true
        }).showToast();
    }, 500);
});

function hexToString(hex) {
    let string = '';
    for (let i = 0; i < hex.length; i += 4) {
        const charCode = parseInt(hex.substr(i, 4), 16);
        string += String.fromCharCode(charCode);
    }
    return string;
}


var TextureName;
var russianShareValue;
async function getShareValueFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareValue = urlParams.get('share');
    console.log(shareValue); // Выведет значение параметра "share" или null, если он отсутствует
    // Проверяем, что значение shareValue не пустое
    if (shareValue) {
        Toastify({
            text: 'Использованная вами ссылка на скин загружается..\nПодождите секунду..',
            duration: 4000, // Продолжительность отображения сообщения в миллисекундах
            close: true
        }).showToast();
        // Вместо простого тайм-аута, вам нужно получить данные для jsonData из асинхронного источника, например, с помощью AJAX запроса
        // Пример с тайм-аутом в 3 секунды для демонстрации
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('Значение в 16-ричном коде:');
        console.log(shareValue);
        // Обратное преобразование из 16-ричного кода в русский текст
        russianShareValue = hexToString(shareValue);
        console.log('Обратное преобразование:');
        console.log(russianShareValue);
        // После получения данных или выполнения асинхронных операций, вызываем GETNameFromCard(russianShareValue)
        if (jsonData) {
            //GETNameFromCard(russianShareValue);
        } else {
            console.log('jsonData is empty');
        }
    }

    LoadTexture(russianShareValue);
}
// Обработчик события DOMContentLoaded
document.addEventListener('DOMContentLoaded', async function () {
    await getShareValueFromURL();
});







function LoadTexture(NameSkins) {
    // Перебираем массив jsonData и ищем объект с соответствующим именем скина
    for (let i = 0; i < jsonData.length; i++) {
        if (jsonData[i].Name === NameSkins) {
            TextureName = jsonData[i].TextureName;
            break;
        }
    }
    console.log(TextureName);

    // В этой точке TextureName содержит значение TextureName для указанного скина
}

var modelTexture;

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas
    });

    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(-10, 3, 0);
    camera.rotation.y = Math.PI * -0.5;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    const textureLoader = new THREE.TextureLoader();
    let newTexture = null;

    alert(TextureName);
    if (TextureName) {
        newTexture = textureLoader.load('./scans/' + TextureName + '.png');
        alert(TextureName);
        newTexture.magFilter = THREE.NearestFilter;
        newTexture.minFilter = THREE.NearestFilter;
    }

    const planeSize = 40;
    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
        map: texture, // Используем новую текстуру, если она есть, иначе - текстуру по умолчанию
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);

    const skyColor = 0xB1E1FF;
    const groundColor = 0xB97A20;
    const intensity = 2;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);

    const color = 0xFFFFFF;
    const dirLightIntensity = 2.5;
    const dirLight = new THREE.DirectionalLight(color, dirLightIntensity);
    dirLight.position.set(0, 10, 0);
    dirLight.target.position.set(-5, 0, 0);
    scene.add(dirLight);
    scene.add(dirLight.target);

    const objLoader = new OBJLoader();
    let model;
    modelTexture = newTexture; // Изначально устанавливаем текстуру по умолчанию

    if (modelTexture) {
        objLoader.load('./rig_norm_0000.obj', (root) => {
            root.traverse((node) => {
                if (node instanceof THREE.Mesh) {
                    node.material = new THREE.MeshPhongMaterial({
                        map: modelTexture,
                    });
                }
            });
            root.position.y = 1;
            scene.add(root);
            model = root;
        });
    } else {
        console.log("No valid texture available for the model.");
    }


    /*const selectbox = document.getElementById('selectbox');

    selectbox.addEventListener('change', () => {
        const selectedValue = selectbox.value;
        modelTexture = textureLoader.load(selectedValue); // Загружаем выбранную текстуру
        modelTexture.magFilter = THREE.NearestFilter;
        modelTexture.minFilter = THREE.NearestFilter;
        model.traverse((node) => {
            if (node instanceof THREE.Mesh) {
                node.material.map = modelTexture; // Применяем выбранную текстуру к модели
            }
        });
    });
    const checkbox = document.getElementById('chedr');

    checkbox.addEventListener('change', () => {
        autoRotation = checkbox.checked;
        if (!autoRotation) {
            model.rotation.y = 0;
        }
    });*/
    let autoRotation = false;

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 3, 0);
    controls.update();

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    function animate() {
        if (autoRotation) {
            model.rotation.y += 0.007;
        }
        controls.update();
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(render);
    animate();
}
//main();