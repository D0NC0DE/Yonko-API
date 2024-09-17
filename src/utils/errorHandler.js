class ErrorHandler extends Error {
    constructor(statusCode, message, data = null) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
    }
}

const handleError = (err, req, res, next) => {
    const { statusCode, message, data } = err;
    res.status(statusCode || 500).json({
        status: "error",
        statusCode: statusCode || 500,
        message: message || "Internal Server Error",
        data: data || null,
    });
};

module.exports = {
    ErrorHandler,
    handleError,
};