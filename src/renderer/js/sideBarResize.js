
import slide from '../asset/resource/Presentation1.png';
import interact from 'interactjs'
interact("#slidePreview").resizable({
    edges: {
        top: false,       // Use pointer coords to check for resize.
        left: false,      // Disable resizing from left edge.
        bottom: false,// Resize if pointer target matches selector
        right: true    // Resize if pointer target is the given Element
    },
    listeners: {
        move: (e) => {
            let {x, y} = e.client
            console.log(`${ ((x / screen.width) * 100) <= 95.159 ? ((x / screen.width)) * 100 : 95.159}%`,`${((x / screen.width) * 100)}`, e)
            if(((x / screen.width) * 100) <= 90.2604 ){
                e.currentTarget.style.flexBasis = `${((x / screen.width)) * 100}%`
            }else{
                e.preventDefault()
            }
            e.currentTarget.style.flexBasis = `${ ((x / screen.width) * 100) <= 95.159 ? ((x / screen.width)) * 100 : 95.159}%`
            console.log(e.currentTarget.style.flexBasis)
            // e.currentTarget.style.flexBasis = `${ (6 <= ((1 - (x / screen.width)) * 100) <= 96.46) * ((1 - (x / screen.width)) * 100)}%`
        }
    }
})