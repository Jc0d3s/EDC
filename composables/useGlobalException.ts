export default function useGlobalException() {
    const isError = ref<boolean>(false);

    function preventError(event: any) {
        log("info", ["event", event]);
    }

    onBeforeMount(() => {
        window.addEventListener("error", preventError);
    });

    onBeforeUnmount(() => {
        window.removeEventListener("error", preventError);
    });

    return { isError };
}
