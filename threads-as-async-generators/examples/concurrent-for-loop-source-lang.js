

function foo(id) {
    for (let i = 0; i < 200000; i++) {
        console.log(`logging ${i} from thread ${id}`);
    }
}

thread(() => foo(1), () => foo(2));

