export const linkGenerator = (len: number) => {
    let options = 'ajhsijah74598749hsjdhx3948uxj3e8oue'  
    let length = options.length
    let ans = ""
    for (let i = 0; i < len; i++) {
        ans += options[Math.floor((Math.random()) * length)]
    }
    return ans
}