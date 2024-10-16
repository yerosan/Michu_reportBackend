const kiyyaModel = require("../models/kiyya_customer");
const formalCustomerModel = require("../models/womenProduct");
const uniqueCustomerModel = require("../models/uniqueIntersection");
const actualMode = require("../models/actual");
const conversionModel = require("../models/conversionData");
const actualDataModel=require("../models/actualData")
const branchCustomerModels=require("../models/branchCustomer")
const noneCodeCustomer=require("../models/noneCodeCustomerList")
const branchList=require("../models/branch_list")
const convesionCustomer=require("../models/coversionCustomer")
const uniqueCustomer=require("../models/uniqueCustomer")
const { where, Op } = require("sequelize");
const customerListModel = require("../models/customerList");
const { escape } = require("mysql2");

const registerInformalCustomerModel = async (req, res) => {
    const dataset= req.body;


    // Utility to format phone number
    function formatPhoneNumber(phoneNumber) {
        if (phoneNumber.startsWith('+251')) {
            return phoneNumber; // No change needed if already with country code
        } else if (phoneNumber.startsWith('0')) {
            return `+251${phoneNumber.substring(1)}`; // Replace leading '0' with '+251'
        }
        return phoneNumber; // Return as is if no changes are needed
    }

    // Validation: Ensure all required fields are provided
    if (!dataset.phone_number || !dataset.account_number || !dataset.initial_working_capital) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
      
         dataset.phone_number = formatPhoneNumber(dataset.phone_number);
     

        const [formalCustomer, informalCustomer, prevCustomer, prev_customer] = await Promise.all([
            kiyyaModel.findOne({
                where: {
                    [Op.or]: [
                        { phone_number: dataset.phone_number },
                        { account_number: dataset.account_number }
                    ]
                }
            }),
            formalCustomerModel.findOne({
                where: {
                    [Op.or]: [
                        { phone_number: dataset.phone_number },
                        { account_no: dataset.account_number }
                    ]
                }
            }),
            conversionModel.findOne({
                where: {
                    saving_account: dataset.account_number,
                    product_type: { [Op.in]: ["Women Informal", "Women formal"] }
                }
            }),
            uniqueCustomerModel.findOne({
                where: {
                    saving_account: dataset.account_number,
                    product_type: { [Op.in]: ["Women Informal", "Women formal"] }
                }
            })
        ]);

        // If customer already exists in any of the sources, return conflict error
        if (formalCustomer || informalCustomer || prevCustomer || prev_customer) {
            return res.status(409).json({ message: "Customer already registered" });
        }

        // If no existing customer found, register new customer
        const registering_customer = await kiyyaModel.create(dataset);

        // If registration succeeds, return success response
        if (registering_customer) {
            return res.status(201).json({ message: "Registration succeeded", data: registering_customer });
        } else {
            return res.status(500).json({ message: "Unable to register customer" });
        }
        
    } catch (err) {
        console.error("An internal error occurred:", err);  // Log error
        return res.status(500).json({ message: "An internal error occurred" });
    }
};


const kiyyaFormalCustomer = async (req, res) => {
    const { phone_number, account_no, ...otherData } = req.body;

    // Utility to format phone number
    function formatPhoneNumber(phoneNumber) {
        if (phoneNumber.startsWith('+251')) {
            return phoneNumber; // No change needed if already with country code
        } else if (phoneNumber.startsWith('0')) {
            return `+251${phoneNumber.substring(1)}`; // Replace leading '0' with '+251'
        }
        return phoneNumber; // Return as is if no changes are needed
    }

    try {
        // Format phone number
        const formattedPhoneNumber = formatPhoneNumber(phone_number);
        console.log("Formatted Phone Number:", formattedPhoneNumber);

        // Query to check if the customer already exists
        const [formalCustomer, informalCustomer, prevCustomer, prev_customer] = await Promise.all([
            kiyyaModel.findOne({
                where: {
                    [Op.or]: [
                        { phone_number: formattedPhoneNumber },
                        { account_number: account_no }
                    ]
                }
            }),
            formalCustomerModel.findOne({
                where: {
                    [Op.or]: [
                        { phone_number: formattedPhoneNumber },
                        { account_no }
                    ]
                }
            }),
            conversionModel.findOne({
                where: {
                    saving_account: account_no,
                    product_type: { [Op.in]: ["Women Informal", "Women formal"] }
                }
            }),
            uniqueCustomerModel.findOne({
                where: {
                    saving_account: account_no,
                    product_type: { [Op.in]: ["Women Informal", "Women formal"] }
                }
            })
        ]);

        // Check if the customer exists in any model
        if (formalCustomer || informalCustomer || prevCustomer || prev_customer) {
            return res.status(200).json({ message: "Customer already registered" });
        }

        // Register the customer if not found
        const registeringCustomer = await formalCustomerModel.create({
            phone_number: formattedPhoneNumber,
            account_no,
            ...otherData // Add remaining data from req.body
        });

        if (registeringCustomer) {
            return res.status(201).json({ message: "Registration succeeded", data: registeringCustomer });
        } else {
            return res.status(500).json({ message: "Unable to register customer" });
        }

    } catch (err) {
        console.error("An internal error occurred:", err);
        return res.status(500).json({ message: "An internal error occurred" });
    }
};


const uniqueCustomerRegisteration=async(req, res)=>{
    const data=req.body

    // Utility to format phone number
    function formatPhoneNumber(phoneNumber) {
        if (phoneNumber.startsWith('+251')) {
            return phoneNumber; // No change needed if already with country code
        } else if (phoneNumber.startsWith('0')) {
            return `+251${phoneNumber.substring(1)}`; // Replace leading '0' with '+251'
        }
        return phoneNumber; // Return as is if no changes are needed
    }
    
    if (!data.phoneNumber || ! data.Saving_Account){
        return res.status(400).json({message:"All field is requied"})
    }else{
        try{

            // Format phone number
        const formattedPhoneNumber = formatPhoneNumber(phone_number);
        // console.log("Formatted Phone Number:", formattedPhoneNumber);
            
            // Query to check if the customer already exists
        const [formalCustomer, informalCustomer, prevCustomer, 
            prev_customer, branchCustomer,customer_list,noneCode,
            actualData,conversionCustomer,uniqueCustomers] = await Promise.all([
            kiyyaModel.findOne({
                where: {
                    [Op.or]: [
                        { phone_number: formattedPhoneNumber },
                        { account_number: data.Saving_Account }
                    ]
                }
            }),
            formalCustomerModel.findOne({
                where: {
                    [Op.or]: [
                        { phone_number: formattedPhoneNumber },
                        { account_no :data.Saving_Account}
                    ]
                }
            }),
            conversionModel.findOne({
                where: {
                    saving_account: data.Saving_Account,
                }
            }),
            uniqueCustomerModel.findOne({
                where: {
                    saving_account: data.saving_account,
                }
            }),

            branchCustomerModels.findOne({
                where: {
                    [Op.or]: [
                        { phoneNumber: formattedPhoneNumber },
                        { Saving_Account :data.Saving_Account}
                    ]
                }
            }),
            customerListModel.findOne({
                where: {
                    [Op.or]: [
                        { phone_number: formattedPhoneNumber },
                        { saving_account :data.Saving_Account}
                    ]
                }
            }),
            noneCodeCustomer.findOne({
                where: {
                    [Op.or]: [
                        { phone_number: formattedPhoneNumber },
                        { saving_account :data.Saving_Account}
                    ]
                }
            }),
            uniqueCustomer.findOne({
                where: {
                    [Op.or]: [
                        { phone_number: formattedPhoneNumber },
                        { saving_account :data.Saving_Account}
                    ]
                }
                
            }),
            convesionCustomer.findOne({
                where: {
                    [Op.or]: [
                        { phoneNumber: formattedPhoneNumber },
                        { Saving_Account :data.Saving_Account}
                    ]
                }
            }),

            actualDataModel.findOne({
                where: {
                    saving_account: data.saving_account,
                }
            })


        ]);

        if (formalCustomer || informalCustomer ||prevCustomer, 
            prev_customer || branchCustomer ||customer_list,noneCode,
            actualData ||conversionCustomer||uniqueCustomers){
                return res.status(409).json({ message: "Customer already registered" })
            }
            else{
                    // Register the customer if not found
                    const registeringCustomer = await branchCustomer.create({
                        phoneNumber: formattedPhoneNumber,
                        Saving_Account,
                        ...otherData // Add remaining data from req.body
                    });

                    if (registeringCustomer) {
                        return res.status(201).json({ message: "Registration succeeded", data: registeringCustomer });
                    } else {
                        return res.status(500).json({ message: "Unable to register customer" });
                    }
            }


        }catch(err){
            console.log("Error:",err)
            return res.status(500).json({message:"An internal error"})
        }
    }

}


module.exports={registerInformalCustomerModel, kiyyaFormalCustomer, uniqueCustomerRegisteration}