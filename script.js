function useVue() {
  let calledEffect = null;

  function ref(rawValue) {
    const isObject = (val) => val !== null && typeof val === "object";
    const listeners = [];
    let _value = isObject(rawValue) ? reactive(rawValue) : rawValue;

    function reactive(rawValue) {
      return new Proxy(rawValue, {
        get(target, key) {
          if (calledEffect) {
            listeners.push(calledEffect);
            calledEffect = null;
          }
          return target[key];
        },
        set(target, key, value) {
          target[key] = value;
          listeners.forEach((cb) => cb());
        },
      });
    }

    return {
      get value() {
        if (calledEffect) {
          listeners.push(calledEffect);
          calledEffect = null;
        }

        return _value;
      },

      set value(newValue) {
        _value = newValue;
        listeners.forEach((cb) => cb());
      },
    };
  }

  function watchEffect(onEffect) {
    calledEffect = onEffect;
    onEffect();
  }

  function computed(cb) {
    let computedEffect = null;
    let value = null;

    const setValue = (newValue) => {
      if (newValue !== value) {
        value = newValue;

        if (computedEffect) {
          computedEffect();
        }
      }
    };

    watchEffect(() => {
      setValue(cb());
    });

    return {
      get value() {
        if (calledEffect) {
          computedEffect = calledEffect;
          calledEffect = null;
          setValue(computedEffect());
        }

        return value;
      },
    };
  }

  return {
    ref,
    watchEffect,
    computed,
  };
}

const { ref, watchEffect, computed } = useVue();

const $buttonAdd = document.getElementById("add");
const $buttonReset = document.getElementById("reset");
const $score = document.getElementById("score");

const state = {
  count: 0,
};

const counterState = ref(state);

const isTooBig = computed(() => {
  debugger;
  return counterState.value.count > 10;
});

watchEffect(renderChangeColor);
watchEffect(renderChangeValue);

function renderChangeValue() {
  console.log("html");
  $score.innerText = `${counterState.value.count}`;
}

function renderChangeColor() {
  console.log("color");
  if (isTooBig.value) {
    $score.style.background = "green";
  } else {
    $score.style.background = "red";
  }
}

$buttonAdd.addEventListener("click", () => {
  counterState.value.count++;
});

$buttonReset.addEventListener("click", () => {
  counterState.value.count = 0;
});

setInterval(() => {
  counterState.value.count += 5;
}, 3000);
