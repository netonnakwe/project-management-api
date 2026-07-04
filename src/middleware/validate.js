module.exports = (schema) => {
    return (req, res, next) => {

        console.log(req.body);
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                errors: result.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message
                }))
            })
        }

        req.body = result.data;

        next();
    }
}