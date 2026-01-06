export function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
    const spinner = (
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-icom-teal border-t-transparent"></div>
    );
    if (fullScreen) {
        return <div className="flex h-screen items-center justify-center bg-gray-50">{spinner}</div>;
    }
    return spinner;
}
