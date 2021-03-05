
    let sceneIndex = 0;
    let theScene = document.getElementById('theScene');

    document.addEventListener('keydown', event => {
        console.log(event);
        if (event.key === 'q') {
            console.log(`emitting:  island-${sceneIndex}`)
            theScene.emit(`island-${sceneIndex++}`, {});
        }
    })


    document.addEventListener('island-1', e => {
        console.log('Island 1 event detected');
    })
