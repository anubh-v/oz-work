

function foo(id) {
    for (let i = 0; i < 200; i++) {
        console.log(`logging ${i} from thread ${id}`);
    }
}

thread(function() { foo(1); }, function() { foo(2); });

