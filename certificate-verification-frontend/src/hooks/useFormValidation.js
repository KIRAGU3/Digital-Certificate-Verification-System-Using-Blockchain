import { useState, useEffect, useCallback } from 'react';

const useFormValidation = (initialValues, validationSchema) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isValid, setIsValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Validate a single field
    const validateField = useCallback(async (name, value) => {
        try {
            await validationSchema.validateAt(name, { [name]: value });
            setErrors(prev => ({ ...prev, [name]: undefined }));
            return undefined;
        } catch (error) {
            const errorMessage = error.message;
            setErrors(prev => ({ ...prev, [name]: errorMessage }));
            return errorMessage;
        }
    }, [validationSchema]);

    // Validate all fields
    const validateForm = useCallback(async (formValues = values) => {
        try {
            await validationSchema.validate(formValues, { abortEarly: false });
            setErrors({});
            return true;
        } catch (error) {
            const validationErrors = {};
            error.inner.forEach((err) => {
                validationErrors[err.path] = err.message;
            });
            setErrors(validationErrors);
            return false;
        }
    }, [validationSchema, values]);

    // Handle field changes
    const handleChange = useCallback((event) => {
        const { name, value } = event.target;
        setValues(prev => ({ ...prev, [name]: value }));
        setTouched(prev => ({ ...prev, [name]: true }));
        setIsDirty(true);
        validateField(name, value);
    }, [validateField]);

    // Handle field blur
    const handleBlur = useCallback((event) => {
        const { name } = event.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, values[name]);
    }, [validateField, values]);

    // Reset form
    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsDirty(false);
    }, [initialValues]);

    // Set form values
    const setFormValues = useCallback((newValues) => {
        setValues(newValues);
        setIsDirty(true);
    }, []);

    // Validate form when values change
    useEffect(() => {
        const validate = async () => {
            const valid = await validateForm();
            setIsValid(valid);
        };
        validate();
    }, [values, validateForm]);

    return {
        values,
        errors,
        touched,
        isValid,
        isDirty,
        handleChange,
        handleBlur,
        resetForm,
        setFormValues,
        validateForm,
        validateField,
    };
};

export default useFormValidation;