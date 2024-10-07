// Utility function to check if a value is not empty
const isNotEmpty = (value) => {
    if (typeof value === 'object') {
        return value !== null && Object.keys(value).length > 0; // Check if object is not empty
    }
    return value !== undefined && value !== null && value !== ''; // Check for primitive types
};

module.exports = { isNotEmpty };
