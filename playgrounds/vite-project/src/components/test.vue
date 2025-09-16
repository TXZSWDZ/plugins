<template>
    <div>
        {{ message }}
    </div>
</template>

<script setup name="Test">
    defineOptions({
        inheritAttrs: false
    });
    import { ref } from 'vue'
    
    const message = ref('Hello World!')
</script>