// Utility function to check if a value is not empty
const isNotEmpty = (value) => {
    if (typeof value === 'object') {
        return value !== null && Object.keys(value).length > 0; 
    }
    return value !== undefined && value !== null && value !== '';
};

module.exports = { isNotEmpty };
