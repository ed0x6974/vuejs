function useVue() {
    let caller = null; 
    const listeners2 = [];

    function ref(state) {
        const listeners = [];

        return new Proxy(state, {
            get(target, prop, receiver) {
                if (caller) {
                    listeners.push(caller);
                    caller = null;
                }
                
                return Reflect.get(target, prop, receiver);
            },
            set(target, prop, value, receiver) {
                const result = Reflect.set(target, prop, value, receiver);

                [...listeners, ...listeners2].forEach(cb => cb());

                return result;
            }
        });
    }

    function watchEffect(cb) {
        caller = cb;
        cb();
    }

    function computed(cb) {
        const listeners = [];
        let currentCaller = null;
        let value = cb(); // но сначала нужно вызвать cb и определить от чего он зависит, и туда его подписать

        const setValue = (bool) => {
            if (bool !== value) {
                value = bool;
                currentCaller();
            }
        }

        const onRefUpdated = () => {
            setValue(cb());
        }

        listeners2.push(onRefUpdated);

        return {
            get value() {
                if (caller) {
                    currentCaller = caller;
                    caller = null;
                }

                return value;
            },
        }
    }

    return {
        ref,
        watchEffect,
        computed,
    }
}

const {
    ref,
    watchEffect,
    computed,
} = useVue();

const $buttonAdd = document.getElementById('add');
const $buttonReset = document.getElementById('reset');
const $score = document.getElementById('score');

const state = {
    value: 0,
}

const counterState = ref(state);

const isTooBig = computed(() => {
    debugger;
    return counterState.value > 10
});

watchEffect(renderChangeColor);
watchEffect(renderChangeValue);

function renderChangeValue() {
    console.log('html');
    $score.innerText = `${counterState.value}`;
}

function renderChangeColor() {
    console.log('color');
    if (isTooBig.value) {
        $score.style.background = "green";
    } else {
        $score.style.background = "red";
    }
}

$buttonAdd.addEventListener('click', () => {
    counterState.value++;
})

$buttonReset.addEventListener('click', () => {
    counterState.value = 0;
})

setInterval(() => {
    counterState.value += 5;
}, 3000);