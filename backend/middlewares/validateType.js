export const validateType = (req, res, next) => {
    const allowedTypes = ["movie", "tv", "person"]; // Example types
    if (!allowedTypes.includes(req.params.type)) {
        return res.status(400).send(null);
    }
    next();
};
